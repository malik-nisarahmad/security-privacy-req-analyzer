import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/guards";
import { NextResponse } from "next/server";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  description: z.string().max(2000).optional().default(""),
});

/**
 * GET /api/projects
 * Returns all projects the authenticated user is a member of.
 */
export async function GET() {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const supabase = await createClient();

  // RLS ensures users only see projects they're members of
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      project_members!inner(role, user_id)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach the current user's role to each project
  const projects = data?.map((project) => {
    const membership = project.project_members?.find(
      (m: { user_id: string }) => m.user_id === user!.id
    );
    return {
      ...project,
      current_user_role: membership?.role || null,
      project_members: undefined, // Don't leak membership details in list
    };
  });

  return NextResponse.json({ data: projects });
}

/**
 * POST /api/projects
 * Creates a new project. The creator is automatically added as project_manager.
 */
export async function POST(request: Request) {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const supabase = await createClient();

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: parsed.data.name,
        description: parsed.data.description,
        created_by: user!.id,
      })
      .select()
      .single();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    // Add the creator as project_manager
    const { error: memberError } = await supabase
      .from("project_members")
      .insert({
        user_id: user!.id,
        project_id: project.id,
        role: "project_manager",
      });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({ data: project }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
