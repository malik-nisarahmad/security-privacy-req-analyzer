import { requireProjectRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const requirementSchema = z.object({
  req_id_label: z.string().min(1, "Requirement ID is required").max(50),
  description: z.string().min(1, "Description is required").max(5000),
  constraints_text: z.string().max(5000).optional().default(""),
  goal_ids: z.array(z.string().uuid()).optional().default([]),
});

/**
 * GET /api/projects/[projectId]/requirements
 * R4: Lists all requirements with linked goals.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "guest");
  if (authError) return authError;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("requirements")
    .select(`
      *,
      requirement_goals(goal_id, goal:goals(id, goal_id_label, description))
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = data?.map((r) => ({
    ...r,
    goals: r.requirement_goals?.map(
      (rg: { goal: { id: string; goal_id_label: string; description: string } }) => rg.goal
    ) || [],
    requirement_goals: undefined,
  }));

  return NextResponse.json({ data: formatted });
}

/**
 * POST /api/projects/[projectId]/requirements
 * R4: Creates a requirement with linked goals.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { user, error: authError } = await requireProjectRole(projectId, "analyst");
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = requirementSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { goal_ids, ...reqData } = parsed.data;
    const supabase = await createClient();

    const { data: requirement, error: reqError } = await supabase
      .from("requirements")
      .insert({
        ...reqData,
        project_id: projectId,
        created_by: user!.id,
      })
      .select()
      .single();

    if (reqError) {
      return NextResponse.json({ error: reqError.message }, { status: 500 });
    }

    // Insert goal junctions
    if (goal_ids.length > 0) {
      const { error } = await supabase
        .from("requirement_goals")
        .insert(goal_ids.map((goalId) => ({
          requirement_id: requirement.id,
          goal_id: goalId,
        })));
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ data: requirement }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
