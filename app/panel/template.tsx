import type { ReactNode } from "react";
import { Suspense } from "react";
import { MatchCelebrationModal } from "@/components/MatchCelebrationModal";
import { MobilePanelRedirect } from "@/components/MobilePanelRedirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MatchRecord = {
  my_post_id: string;
  other_post_id: string;
  other_full_name: string;
  other_pid: string;
  other_district: string;
};

type PanelTemplateProps = {
  children: ReactNode;
};

export default async function PanelTemplate({
  children,
}: PanelTemplateProps) {
  const supabase =
    createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let matches: MatchRecord[] = [];

  if (user) {
    const {
      data,
      error,
    } = await supabase.rpc(
      "get_my_matches"
    );

    if (error) {
      console.error(
        "No se pudieron cargar los matches para la ventana emergente:",
        error.message
      );
    }

    matches =
      (data ?? []) as MatchRecord[];
  }

  const modalMatches = matches.map(
    (match) => ({
      my_post_id:
        match.my_post_id,
      other_post_id:
        match.other_post_id,
      other_full_name:
        match.other_full_name,
      other_pid:
        match.other_pid,
      other_district:
        match.other_district,
    })
  );

  return (
    <>
      <Suspense fallback={null}>
        <MobilePanelRedirect />

        <MatchCelebrationModal
          matches={modalMatches}
        />
      </Suspense>

      {children}
    </>
  );
}
