import { requireProjectRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateScenarioSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sources: z.string().max(2000).optional(),
  actors: z.string().max(2000).optional(),
  events: z.string().max(2000).optional(),
  actions: z.string().max(2000).optional(),
  obstacles: z.string().max(2000).optional(),
  constraints_text: z.string().max(2000).optional(),
  pre_conditions: z.string().max(2000).optional(),
  post_conditions: z.string().max(2000).optional(),
  status: z.string().max(100).optional(),
  issues: z.string().max(2000).optional(),
  goal_ids: z.array(z.string().uuid()).optional(),
  requirement_ids: z.array(z.string().uuid()).optional(),
});

/**
 * GET /api/projects/[projectId]/scenarios/[scenarioId]
 * R3: View a single scenario with full details.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; scenarioId: string }> }
) {
  const { projectId, scenarioId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "guest");
  if (authError) return authError;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scenarios")
    .select(`
      *,
      scenario_goals(goal_id, goal:goals(id, goal_id_label, description)),
      scenario_requirements(requirement_id, requirement:requirements(id, req_id_label, description))
    `)
    .eq("id", scenarioId)
    .eq("project_id", projectId)
    .single();

  if (error) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  const formatted = {
    ...data,
    goals: data.scenario_goals?.map(
      (sg: { goal: { id: string; goal_id_label: string; description: string } }) => sg.goal
    ) || [],
    requirements: data.scenario_requirements?.map(
      (sr: { requirement: { id: string; req_id_label: string; description: string } }) => sr.requirement
    ) || [],
    scenario_goals: undefined,
    scenario_requirements: undefined,
  };

  return NextResponse.json({ data: formatted });
}

/**
 * PUT /api/projects/[projectId]/scenarios/[scenarioId]
 * R3: Update a scenario. Replaces junction links if provided.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string; scenarioId: string }> }
) {
  const { projectId, scenarioId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "analyst");
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = updateScenarioSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { goal_ids, requirement_ids, ...scenarioData } = parsed.data;
    const supabase = await createClient();

    // Update scenario fields
    const { data: scenario, error: scenarioError } = await supabase
      .from("scenarios")
      .update({ ...scenarioData, updated_at: new Date().toISOString() })
      .eq("id", scenarioId)
      .eq("project_id", projectId)
      .select()
      .single();

    if (scenarioError) {
      return NextResponse.json({ error: scenarioError.message }, { status: 500 });
    }

    // Replace goal junctions if provided
    if (goal_ids !== undefined) {
      await supabase.from("scenario_goals").delete().eq("scenario_id", scenarioId);
      if (goal_ids.length > 0) {
        await supabase.from("scenario_goals").insert(
          goal_ids.map((goalId) => ({ scenario_id: scenarioId, goal_id: goalId }))
        );
      }
    }

    // Replace requirement junctions if provided
    if (requirement_ids !== undefined) {
      await supabase.from("scenario_requirements").delete().eq("scenario_id", scenarioId);
      if (requirement_ids.length > 0) {
        await supabase.from("scenario_requirements").insert(
          requirement_ids.map((reqId) => ({ scenario_id: scenarioId, requirement_id: reqId }))
        );
      }
    }

    return NextResponse.json({ data: scenario });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/scenarios/[scenarioId]
 * R3: Delete a scenario. Cascades to junction tables.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; scenarioId: string }> }
) {
  const { projectId, scenarioId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "analyst");
  if (authError) return authError;

  const supabase = await createClient();

  const { error } = await supabase
    .from("scenarios")
    .delete()
    .eq("id", scenarioId)
    .eq("project_id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { message: "Scenario deleted" } });
}
