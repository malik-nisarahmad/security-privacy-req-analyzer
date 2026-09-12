import { requireProjectRole } from "@/lib/auth/guards";
import { NextResponse } from "next/server";
import { calculateFlesch } from "@/lib/flesch";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const readabilitySchema = z.object({
  text: z.string().optional(),
  policy_id: z.string().uuid().optional(),
}).refine(
  (data) => data.text || data.policy_id,
  { message: "Either text or policy_id is required" }
);

/**
 * POST /api/projects/[projectId]/readability
 * R5 (FR-FRE 1): Calculates FRES and FGL for given text or a stored policy.
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
    const parsed = readabilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    let textToAnalyze = parsed.data.text || "";

    // If policy_id provided, fetch the policy content
    if (parsed.data.policy_id) {
      const supabase = await createClient();
      const { data: policy, error } = await supabase
        .from("policies")
        .select("content, title")
        .eq("id", parsed.data.policy_id)
        .eq("project_id", projectId)
        .single();

      if (error || !policy) {
        return NextResponse.json({ error: "Policy not found" }, { status: 404 });
      }

      textToAnalyze = policy.content;

      if (!textToAnalyze.trim()) {
        return NextResponse.json(
          { error: "Policy has no text content to analyze" },
          { status: 400 }
        );
      }
    }

    if (!textToAnalyze.trim()) {
      return NextResponse.json(
        { error: "No text provided for analysis" },
        { status: 400 }
      );
    }

    const result = calculateFlesch(textToAnalyze);

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
