import { requireProjectRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { formatZodError } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";

const policySchema = z.object({
  title: z.string().min(1, "Policy title is required").max(500),
  domain: z.string().max(200).optional().default(""),
  content: z.string().optional().default(""),
  url: z.string().max(2000).optional().default(""),
});

/**
 * GET /api/projects/[projectId]/policies
 * R7: RLS handles guest visibility filtering at DB level.
 * Policies are returned alphabetically by title (FR-ADM 5).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { error: authError } = await requireProjectRole(projectId, "guest");
  if (authError) return authError;

  const supabase = await createClient();

  // RLS automatically filters: guests only see granted policies
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .eq("project_id", projectId)
    .order("title", { ascending: true }); // R7: alphabetical order

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/**
 * POST /api/projects/[projectId]/policies
 * Only PMs and above can add policies.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { user, error: authError } = await requireProjectRole(projectId, "project_manager");
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = policySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("policies")
      .insert({
        ...parsed.data,
        project_id: projectId,
        created_by: user!.id,
      })
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
