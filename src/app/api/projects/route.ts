import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/guards";
import { formatZodError } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().default(""),
});

/**
 * GET /api/projects
 * R1/R8: Returns projects the current user is a member of.
 */
export async function GET() {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      description,
      created_by,
      created_at,
      updated_at,
      project_members!inner(role)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format to include the user's role on the project
  const formatted = (projects || []).map((p) => {
    const member = Array.isArray(p.project_members)
      ? p.project_members[0]
      : p.project_members;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      created_by: p.created_by,
      created_at: p.created_at,
      updated_at: p.updated_at,
      user_role: member?.role || "guest",
    };
  });

  return NextResponse.json({ data: formatted });
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
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
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
