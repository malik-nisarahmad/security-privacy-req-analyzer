import { requireProjectRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const goalSchema = z.object({
  goal_id_label: z.string().min(1, "Goal ID is required").max(50),
  description: z.string().min(1, "Description is required").max(5000),
  taxonomy_id: z.string().uuid().nullable().optional(),
  actor: z.string().max(500).optional().default(""),
  policy_id: z.string().uuid().nullable().optional(),
  granularity: z.enum(["policy", "scenario"]).optional().default("policy"),
  observability: z.enum(["observable", "unobservable"]).optional().default("observable"),
  occurrences: z.number().int().min(0).optional().default(0),
  context_info: z.string().max(5000).optional().default(""),
  relevant_legislation: z.string().max(1000).optional().default(""),
  subject_ids: z.array(z.string().uuid()).optional().default([]),
});

/**
 * GET /api/projects/[projectId]/goals
 * R2: Lists all goals in a project. Includes taxonomy and subject classifications.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "guest");
  if (authError) return authError;

  const supabase = await createClient();

  const { data: goals, error } = await supabase
    .from("goals")
    .select(`
      *,
      taxonomy:taxonomy_categories(*),
      policy:policies(id, title),
      goal_subjects(subject_id, subject:subject_classifications(*))
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten subjects for easier frontend consumption
  const formatted = goals?.map((goal) => ({
    ...goal,
    subjects: goal.goal_subjects?.map(
      (gs: { subject: { id: string; name: string } }) => gs.subject
    ) || [],
    goal_subjects: undefined,
  }));

  return NextResponse.json({ data: formatted });
}

/**
 * POST /api/projects/[projectId]/goals
 * R2: Creates a new goal. Only Analysts and above.
 * Handles subject_ids as a separate junction table insert.
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
    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { subject_ids, ...goalData } = parsed.data;
    const supabase = await createClient();

    // Insert the goal
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .insert({
        ...goalData,
        project_id: projectId,
        created_by: user!.id,
      })
      .select()
      .single();

    if (goalError) {
      return NextResponse.json({ error: goalError.message }, { status: 500 });
    }

    // Insert subject classifications (many-to-many junction)
    if (subject_ids.length > 0) {
      const junctionRows = subject_ids.map((subjectId) => ({
        goal_id: goal.id,
        subject_id: subjectId,
      }));

      const { error: subjectError } = await supabase
        .from("goal_subjects")
        .insert(junctionRows);

      if (subjectError) {
        return NextResponse.json({ error: subjectError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ data: goal }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
