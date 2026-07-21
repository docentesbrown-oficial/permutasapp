"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendMatchEmail } from "@/lib/mailer";

type MatchLookup = {
  my_post_id: string;
  my_description: string;
  my_pid: string;
  my_school: string;
  my_district: string;

  other_post_id: string;
  other_description: string;
  other_pid: string;
  other_school: string;
  other_district: string;

  other_full_name: string;
  other_email: string;
};

type OwnProfile = {
  full_name: string;
};

export async function createInterest(
  formData: FormData
) {
  const supabase =
    createSupabaseServerClient();

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

  const { error } = await supabase
    .from("interests")
    .upsert(
      {
        requester_user_id: user.id,
        offered_post_id: offeredPostId,
        target_post_id: targetPostId,
        status: "active",
      },
      {
        onConflict:
          "offered_post_id,target_post_id",
      }
    );

  if (error) {
    console.error(
      "No se pudo guardar el interés:",
      error.message
    );

    return;
  }

  const {
    data: matchesData,
    error: matchesError,
  } = await supabase.rpc(
    "get_my_matches"
  );

  if (matchesError) {
    console.error(
      "No se pudo comprobar el match:",
      matchesError.message
    );
  }

  const matches =
    (matchesData ?? []) as MatchLookup[];

  const newMatch = matches.find(
    (match) =>
      match.my_post_id ===
        offeredPostId &&
      match.other_post_id ===
        targetPostId
  );

  revalidatePath("/panel");

  if (newMatch) {
    const matchKey = [
      newMatch.my_post_id,
      newMatch.other_post_id,
    ]
      .sort()
      .join("--");

    const {
      data: ownProfileData,
      error: ownProfileError,
    } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (ownProfileError) {
      console.error(
        "No se pudo cargar el perfil para el correo:",
        ownProfileError.message
      );
    }

    const ownProfile =
      ownProfileData as OwnProfile | null;

    const ownName =
      ownProfile?.full_name ??
      user.email ??
      "Docente";

    const emailTasks: Promise<void>[] = [];

    if (user.email) {
      emailTasks.push(
        sendMatchEmail({
          to: user.email,
          recipientName: ownName,
          otherTeacherName:
            newMatch.other_full_name,
          pid: newMatch.my_pid,
          ownPost: {
            description:
              newMatch.my_description,
            school:
              newMatch.my_school,
            district:
              newMatch.my_district,
          },
          otherPost: {
            description:
              newMatch.other_description,
            school:
              newMatch.other_school,
            district:
              newMatch.other_district,
          },
          matchKey,
        })
      );
    }

    if (newMatch.other_email) {
      emailTasks.push(
        sendMatchEmail({
          to: newMatch.other_email,
          recipientName:
            newMatch.other_full_name,
          otherTeacherName: ownName,
          pid: newMatch.other_pid,
          ownPost: {
            description:
              newMatch.other_description,
            school:
              newMatch.other_school,
            district:
              newMatch.other_district,
          },
          otherPost: {
            description:
              newMatch.my_description,
            school:
              newMatch.my_school,
            district:
              newMatch.my_district,
          },
          matchKey,
        })
      );
    }

    const emailResults =
      await Promise.allSettled(
        emailTasks
      );

    emailResults.forEach(
      (result, index) => {
        if (
          result.status === "rejected"
        ) {
          console.error(
            `No se pudo enviar el correo ${index + 1}:`,
            result.reason
          );
        }
      }
    );

    redirect(
      `/panel?match=${encodeURIComponent(
        matchKey
      )}`
    );
  }
}

export async function withdrawInterest(
  formData: FormData
) {
  const supabase =
    createSupabaseServerClient();

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

  const { error } = await supabase
    .from("interests")
    .update({
      status: "withdrawn",
    })
    .eq(
      "requester_user_id",
      user.id
    )
    .eq(
      "offered_post_id",
      offeredPostId
    )
    .eq(
      "target_post_id",
      targetPostId
    );

  if (error) {
    console.error(
      "No se pudo retirar el interés:",
      error.message
    );

    return;
  }

  revalidatePath("/panel");
}

export async function dismissOffer(
  formData: FormData
) {
  const supabase =
    createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const targetPostId = String(
    formData.get("target_post_id") ?? ""
  ).trim();

  if (!targetPostId) {
    return;
  }

  const { error } = await supabase
    .from("dismissed_offers")
    .upsert(
      {
        user_id: user.id,
        target_post_id:
          targetPostId,
      },
      {
        onConflict:
          "user_id,target_post_id",
      }
    );

  if (error) {
    console.error(
      "No se pudo descartar el ofrecimiento:",
      error.message
    );

    return;
  }

  revalidatePath("/panel");
}
