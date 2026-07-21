import Link from "next/link";
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
    <>
      <div className="mobile-new-course-bar">
        <Link href="/panel/movil/nuevo">
          <span>＋</span>
          Ofrecer nuevo curso
        </Link>
      </div>

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

      <style>{`
        .mobile-new-course-bar {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 10px 16px;
          background: #24496e;
          box-shadow:
            0 7px 20px
            rgba(36, 73, 110, 0.18);
        }

        .mobile-new-course-bar a {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          max-width: 520px;
          min-height: 43px;
          margin: 0 auto;
          border-radius: 13px;
          background: #f3efdc;
          color: #24496e;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
        }

        .mobile-new-course-bar span {
          color: #da6863;
          font-size: 21px;
          line-height: 1;
        }
      `}</style>
    </>
  );
}
