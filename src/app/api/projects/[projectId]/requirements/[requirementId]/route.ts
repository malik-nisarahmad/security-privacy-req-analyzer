import { requireProjectRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateRequirementSchema = z.object({
  req_id_label: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(5000).optional(),
  constraints_text: z.string().max(5000).optional(),
  goal_ids: z.array(z.string().uuid()).optional(),
});

/**
 * GET /api/projects/[projectId]/requirements/[requirementId]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; requirementId: string }> }
) {
  const { projectId, requirementId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "guest");
  if (authError) return authError;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("requirements")
    .select(`
      *,
      requirement_goals(goal_id, goal:goals(id, goal_id_label, description))
    `)
    .eq("id", requirementId)
    .eq("project_id", projectId)
    .single();

  if (error) {
    return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
  }

  const formatted = {
    ...data,
    goals: data.requirement_goals?.map(
      (rg: { goal: { id: string; goal_id_label: string; description: string } }) => rg.goal
    ) || [],
    requirement_goals: undefined,
  };

  return NextResponse.json({ data: formatted });
}

/**
 * PUT /api/projects/[projectId]/requirements/[requirementId]
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string; requirementId: string }> }
) {
  const { projectId, requirementId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "analyst");
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = updateRequirementSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { goal_ids, ...reqData } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("requirements")
      .update({ ...reqData, updated_at: new Date().toISOString() })
      .eq("id", requirementId)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (goal_ids !== undefined) {
      await supabase.from("requirement_goals").delete().eq("requirement_id", requirementId);
      if (goal_ids.length > 0) {
        await supabase.from("requirement_goals").insert(
          goal_ids.map((goalId) => ({ requirement_id: requirementId, goal_id: goalId }))
        );
      }
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/requirements/[requirementId]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; requirementId: string }> }
) {
  const { projectId, requirementId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "analyst");
  if (authError) return authError;

  const supabase = await createClient();

  const { error } = await supabase
    .from("requirements")
    .delete()
    .eq("id", requirementId)
    .eq("project_id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { message: "Requirement deleted" } });
}
