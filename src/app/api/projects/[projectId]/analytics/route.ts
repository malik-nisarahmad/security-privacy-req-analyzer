import { requireProjectRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const addOccurrenceSchema = z.object({
  goal_id: z.string().uuid("Valid goal ID required"),
  policy_id: z.string().uuid("Valid policy ID required"),
  occurrence_count: z.number().int().min(0, "Count must be non-negative"),
});

/**
 * GET /api/projects/[projectId]/analytics
 * R6 (FR-GSM 10, 11, 12):
 * - goal_id → all policies the goal appears in (traceability)
 * - policy_id → distinct goals + occurrence counts
 * - Both → specific occurrence count
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "guest");
  if (authError) return authError;

  const supabase = await createClient();
  const url = new URL(request.url);
  const goalId = url.searchParams.get("goal_id");
  const policyId = url.searchParams.get("policy_id");

  // FR-GSM 10: Select a goal → view all policies it appears in
  if (goalId && !policyId) {
    const { data, error } = await supabase
      .from("goal_policy_occurrences")
      .select(`
        *,
        policy:policies(id, title, domain)
      `)
      .eq("goal_id", goalId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  // FR-GSM 12: Select a policy → count of distinct goals + their occurrences
  if (policyId && !goalId) {
    const { data, error } = await supabase
      .from("goal_policy_occurrences")
      .select(`
        *,
        goal:goals(id, goal_id_label, description)
      `)
      .eq("policy_id", policyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        occurrences: data,
        distinct_goal_count: data?.length || 0,
      },
    });
  }

  // FR-GSM 11: Specific goal + policy → occurrence count
  if (goalId && policyId) {
    const { data, error } = await supabase
      .from("goal_policy_occurrences")
      .select("*")
      .eq("goal_id", goalId)
      .eq("policy_id", policyId)
      .single();

    if (error) {
      return NextResponse.json({
        data: { occurrence_count: 0, goal_id: goalId, policy_id: policyId },
      });
    }

    return NextResponse.json({ data });
  }

  // No filters — return all occurrences for the project
  const { data, error } = await supabase
    .from("goal_policy_occurrences")
    .select(`
      *,
      goal:goals!inner(id, goal_id_label, description, project_id),
      policy:policies(id, title, domain)
    `)
    .eq("goal.project_id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/**
 * POST /api/projects/[projectId]/analytics
 * R6: Add/update a goal-policy occurrence count.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "analyst");
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = addOccurrenceSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const supabase = await createClient();

    // Upsert — update if exists, insert if not
    const { data, error } = await supabase
      .from("goal_policy_occurrences")
      .upsert(
        {
          goal_id: parsed.data.goal_id,
          policy_id: parsed.data.policy_id,
          occurrence_count: parsed.data.occurrence_count,
        },
        { onConflict: "goal_id,policy_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
