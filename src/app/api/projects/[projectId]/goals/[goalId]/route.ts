import { requireProjectRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateGoalSchema = z.object({
  goal_id_label: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(5000).optional(),
  taxonomy_id: z.string().uuid().nullable().optional(),
  actor: z.string().max(500).optional(),
  policy_id: z.string().uuid().nullable().optional(),
  granularity: z.enum(["policy", "scenario"]).optional(),
  observability: z.enum(["observable", "unobservable"]).optional(),
  occurrences: z.number().int().min(0).optional(),
  context_info: z.string().max(5000).optional(),
  relevant_legislation: z.string().max(1000).optional(),
  subject_ids: z.array(z.string().uuid()).optional(),
});

/**
 * GET /api/projects/[projectId]/goals/[goalId]
 * R2: View a single goal with full details.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; goalId: string }> }
) {
  const { projectId, goalId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "guest");
  if (authError) return authError;

  const supabase = await createClient();

  const { data: goal, error } = await supabase
    .from("goals")
    .select(`
      *,
      taxonomy:taxonomy_categories(*),
      policy:policies(id, title),
      goal_subjects(subject_id, subject:subject_classifications(*))
    `)
    .eq("id", goalId)
    .eq("project_id", projectId)
    .single();

  if (error) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const formatted = {
    ...goal,
    subjects: goal.goal_subjects?.map(
      (gs: { subject: { id: string; name: string } }) => gs.subject
    ) || [],
    goal_subjects: undefined,
  };

  return NextResponse.json({ data: formatted });
}

/**
 * PUT /api/projects/[projectId]/goals/[goalId]
 * R2: Update a goal. Replaces subject classifications entirely.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string; goalId: string }> }
) {
  const { projectId, goalId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "analyst");
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = updateGoalSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { subject_ids, ...goalData } = parsed.data;
    const supabase = await createClient();

    // Update the goal fields
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .update({ ...goalData, updated_at: new Date().toISOString() })
      .eq("id", goalId)
      .eq("project_id", projectId)
      .select()
      .single();

    if (goalError) {
      return NextResponse.json({ error: goalError.message }, { status: 500 });
    }

    // Replace subject classifications if provided
    if (subject_ids !== undefined) {
      // Delete existing
      await supabase
        .from("goal_subjects")
        .delete()
        .eq("goal_id", goalId);

      // Insert new
      if (subject_ids.length > 0) {
        const junctionRows = subject_ids.map((subjectId) => ({
          goal_id: goalId,
          subject_id: subjectId,
        }));

        const { error: subjectError } = await supabase
          .from("goal_subjects")
          .insert(junctionRows);

        if (subjectError) {
          return NextResponse.json({ error: subjectError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ data: goal });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/goals/[goalId]
 * R2: Delete a goal. Cascades to junction tables.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; goalId: string }> }
) {
  const { projectId, goalId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "analyst");
  if (authError) return authError;

  const supabase = await createClient();

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("project_id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { message: "Goal deleted" } });
}
