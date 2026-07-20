"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createInterest(formData: FormData) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const offeredPostId = String(
    formData.get("offered_post_id") ?? ""
  ).trim();

  const targetPostId = String(
    formData.get("target_post_id") ?? ""
  ).trim();

  if (!offeredPostId || !targetPostId) {
    return;
  }

  const { error } = await supabase.from("interests").upsert(
    {
      requester_user_id: user.id,
      offered_post_id: offeredPostId,
      target_post_id: targetPostId,
      status: "active",
    },
    {
      onConflict: "offered_post_id,target_post_id",
    }
  );

  if (error) {
    console.error("No se pudo guardar el interés:", error.message);
    return;
  }

  revalidatePath("/panel");
}
