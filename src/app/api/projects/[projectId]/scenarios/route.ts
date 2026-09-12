import { requireProjectRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const scenarioSchema = z.object({
  name: z.string().min(1, "Scenario name is required").max(200),
  sources: z.string().max(2000).optional().default(""),
  actors: z.string().max(2000).optional().default(""),
  events: z.string().max(2000).optional().default(""),
  actions: z.string().max(2000).optional().default(""),
  obstacles: z.string().max(2000).optional().default(""),
  constraints_text: z.string().max(2000).optional().default(""),
  pre_conditions: z.string().max(2000).optional().default(""),
  post_conditions: z.string().max(2000).optional().default(""),
  status: z.string().max(100).optional().default(""),
  issues: z.string().max(2000).optional().default(""),
  goal_ids: z.array(z.string().uuid()).optional().default([]),
  requirement_ids: z.array(z.string().uuid()).optional().default([]),
});

/**
 * GET /api/projects/[projectId]/scenarios
 * R3: Lists all scenarios with linked goals and requirements.
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
    .from("scenarios")
    .select(`
      *,
      scenario_goals(goal_id, goal:goals(id, goal_id_label, description)),
      scenario_requirements(requirement_id, requirement:requirements(id, req_id_label, description))
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten joined data
  const formatted = data?.map((s) => ({
    ...s,
    goals: s.scenario_goals?.map(
      (sg: { goal: { id: string; goal_id_label: string; description: string } }) => sg.goal
    ) || [],
    requirements: s.scenario_requirements?.map(
      (sr: { requirement: { id: string; req_id_label: string; description: string } }) => sr.requirement
    ) || [],
    scenario_goals: undefined,
    scenario_requirements: undefined,
  }));

  return NextResponse.json({ data: formatted });
}

/**
 * POST /api/projects/[projectId]/scenarios
 * R3: Creates a scenario with linked goals and requirements (junction tables).
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
    const parsed = scenarioSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { goal_ids, requirement_ids, ...scenarioData } = parsed.data;
    const supabase = await createClient();

    // Insert scenario
    const { data: scenario, error: scenarioError } = await supabase
      .from("scenarios")
      .insert({
        ...scenarioData,
        project_id: projectId,
        created_by: user!.id,
      })
      .select()
      .single();

    if (scenarioError) {
      return NextResponse.json({ error: scenarioError.message }, { status: 500 });
    }

    // Insert goal junctions
    if (goal_ids.length > 0) {
      const { error } = await supabase
        .from("scenario_goals")
        .insert(goal_ids.map((goalId) => ({
          scenario_id: scenario.id,
          goal_id: goalId,
        })));
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Insert requirement junctions
    if (requirement_ids.length > 0) {
      const { error } = await supabase
        .from("scenario_requirements")
        .insert(requirement_ids.map((reqId) => ({
          scenario_id: scenario.id,
          requirement_id: reqId,
        })));
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ data: scenario }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
