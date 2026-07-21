import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MobileOffersDeck } from "@/components/MobileOffersDeck";
import type { Puesto } from "@/lib/types";

type Profile = {
  full_name: string;
  preferred_districts: string[] | null;
};

export default async function MobilePanelPage() {
  const supabase =
    createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profileData },
    { data: puestosData },
    { data: interestsData },
    { data: dismissedData },
    { data: matchesData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, preferred_districts"
      )
      .eq("id", user.id)
      .single(),

    supabase
      .from("puestos")
      .select(
        "id, description, pid, school, district, schedule, status, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("interests")
      .select("target_post_id")
      .eq(
        "requester_user_id",
        user.id
      )
      .eq("status", "active"),

    supabase
      .from("dismissed_offers")
      .select("target_post_id")
      .eq("user_id", user.id),

    supabase.rpc("get_my_matches"),
  ]);

  const profile = (
    profileData ?? {
      full_name:
        user.email ?? "Docente",
      preferred_districts: [],
    }
  ) as Profile;

  const myPuestos =
    (puestosData ?? []) as Puesto[];

  const publishedPids = [
    ...new Set(
      myPuestos
        .filter(
          (puesto) =>
            puesto.status ===
            "published"
        )
        .map(
          (puesto) => puesto.pid
        )
    ),
  ];

  let offers: Puesto[] = [];

  if (publishedPids.length > 0) {
    const { data: offersData } =
      await supabase
        .from("puestos")
        .select(
          "id, description, pid, school, district, schedule, status, created_at"
        )
        .in("pid", publishedPids)
        .neq("user_id", user.id)
        .eq("status", "published")
        .order("created_at", {
          ascending: false,
        });

    offers =
      (offersData ?? []) as Puesto[];
  }

  const dismissedIds = new Set(
    (dismissedData ?? []).map(
      (item) => item.target_post_id
    )
  );

  const visibleOffers =
    offers.filter(
      (offer) =>
        !dismissedIds.has(offer.id)
    );

  const preferredDistricts =
    profile.preferred_districts ?? [];

  const preferredOffers =
    visibleOffers.filter(
      (offer) =>
        preferredDistricts.includes(
          offer.district
        )
    );

  const otherOffers =
    visibleOffers.filter(
      (offer) =>
        !preferredDistricts.includes(
          offer.district
        )
    );

  const activeTargetPostIds =
    (interestsData ?? []).map(
      (interest) =>
        interest.target_post_id
    );

  const matchesCount = Array.isArray(
    matchesData
  )
    ? matchesData.length
    : 0;

  return (
    <MobileOffersDeck
      fullName={profile.full_name}
      preferredOffers={
        preferredOffers
      }
      otherOffers={otherOffers}
      myPuestos={myPuestos}
      activeTargetPostIds={
        activeTargetPostIds
      }
      matchesCount={matchesCount}
    />
  );
}
