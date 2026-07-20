import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PanelHeader } from "@/components/PanelHeader";
import { PreferredDistrictsForm } from "@/components/PreferredDistrictsForm";
import { PuestoManager } from "@/components/PuestoManager";
import type { Puesto } from "@/lib/types";
import { createInterest } from "./actions";

type Profile = {
  full_name: string;
  preferred_districts: string[] | null;
};

type InterestSummary = {
  target_post_id: string;
  offered_post_id: string;
  status: string;
};

export default async function PanelPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: puestos }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, preferred_districts")
      .eq("id", user.id)
      .single(),

    supabase
      .from("puestos")
      .select(
        "id, description, pid, school, district, schedule, status, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const safeProfile = (
    profile ?? {
      full_name: user.email ?? "Docente",
      preferred_districts: [],
    }
  ) as Profile;

  const myPuestos = (puestos ?? []) as Puesto[];

  const pids = [...new Set(myPuestos.map((puesto) => puesto.pid))];

  let offered: (Puesto & { user_id?: string })[] = [];

  if (pids.length > 0) {
    const { data } = await supabase
      .from("puestos")
      .select(
        "id, user_id, description, pid, school, district, schedule, status, created_at"
      )
      .in("pid", pids)
      .neq("user_id", user.id)
      .eq("status", "published");

    offered = (data ?? []) as (Puesto & { user_id?: string })[];
  }

  const { data: interests } = await supabase
    .from("interests")
    .select("target_post_id, offered_post_id, status")
    .eq("requester_user_id", user.id)
    .eq("status", "active");

  const activeInterests = (interests ?? []) as InterestSummary[];

  const preferred = safeProfile.preferred_districts ?? [];

  const preferredOffers = offered.filter((item) =>
    preferred.includes(item.district)
  );

  const otherOffers = offered.filter(
    (item) => !preferred.includes(item.district)
  );

  return (
    <>
      <PanelHeader fullName={safeProfile.full_name} />

      <main className="shell panel-grid">
        <aside className="sidebar">
          <section className="card">
            <h3>Tu perfil de búsqueda</h3>
            <PreferredDistrictsForm initialDistricts={preferred} />
          </section>

          <section className="card">
            <h3>Cómo se ordenan</h3>

            <p className="help">
              La app busca todos los ofrecimientos con tus mismos PID. Primero
              muestra los distritos preferidos y luego el resto.
            </p>
          </section>
        </aside>

        <div className="content">
          <section className="card">
            <span className="eyebrow">Panel inicial</span>

            <h2>Tu espacio de permutas</h2>

            <div className="stat-row">
              <div className="stat">
                <strong>{myPuestos.length}</strong>
                <span>Puestos cargados</span>
              </div>

              <div className="stat">
                <strong>{offered.length}</strong>
                <span>Ofrecimientos con tus PID</span>
              </div>

              <div className="stat">
                <strong>{preferredOffers.length}</strong>
                <span>En distritos preferidos</span>
              </div>
            </div>
          </section>

          <PuestoManager initialPuestos={myPuestos} />

          <section className="card">
            <h2>Posibles permutas</h2>

            {pids.length === 0 ? (
              <div className="empty">
                Cargá al menos un puesto para empezar a buscar ofrecimientos
                por PID.
              </div>
            ) : offered.length === 0 ? (
              <div className="empty">
                Todavía nadie ofreció un puesto con los códigos PID que
                cargaste.
              </div>
            ) : (
              <>
                <OfferSection
                  title="En tus distritos preferidos"
                  offers={preferredOffers}
                  myPuestos={myPuestos}
                  activeInterests={activeInterests}
                  preferred
                />

                <OfferSection
                  title="Otras posibilidades"
                  offers={otherOffers}
                  myPuestos={myPuestos}
                  activeInterests={activeInterests}
                />
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function OfferSection({
  title,
  offers,
  myPuestos,
  activeInterests,
  preferred = false,
}: {
  title: string;
  offers: Puesto[];
  myPuestos: Puesto[];
  activeInterests: InterestSummary[];
  preferred?: boolean;
}) {
  if (offers.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3>{title}</h3>

      <div className="job-list">
        {offers.map((offer) => {
          const compatibleOwnPosts = myPuestos.filter(
            (puesto) =>
              puesto.pid === offer.pid && puesto.status === "published"
          );

          const existingInterest = activeInterests.find(
            (interest) => interest.target_post_id === offer.id
          );

          return (
            <article className="job-item" key={offer.id}>
              <div className="job-item-top">
                <div>
                  <h3 className="job-title">{offer.description}</h3>

                  <p className="job-sub">
                    PID {offer.pid} · {offer.school} · {offer.district}
                  </p>
                </div>

                {preferred ? (
                  <span className="badge badge-preferred">Preferido</span>
                ) : null}
              </div>

              <div style={{ marginTop: 12 }}>
                {offer.schedule.map((item, index) => (
                  <span
                    className="schedule-chip"
                    key={`${offer.id}-${index}`}
                  >
                    {item.day}: {item.from}–{item.to}
                  </span>
                ))}
              </div>

              <div className="hero-actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  disabled
                  title="Se habilitará más adelante"
                >
                  No me sirve
                </button>

                {existingInterest ? (
                  <span className="badge badge-preferred">
                    Interés enviado
                  </span>
                ) : (
                  <form action={createInterest}>
                    <input
                      type="hidden"
                      name="target_post_id"
                      value={offer.id}
                    />

                    {compatibleOwnPosts.length === 1 ? (
                      <input
                        type="hidden"
                        name="offered_post_id"
                        value={compatibleOwnPosts[0].id}
                      />
                    ) : compatibleOwnPosts.length > 1 ? (
                      <label>
                        <span className="help">
                          Elegí cuál de tus puestos ofrecés
                        </span>

                        <select name="offered_post_id" required>
                          <option value="">Seleccionar puesto</option>

                          {compatibleOwnPosts.map((puesto) => (
                            <option key={puesto.id} value={puesto.id}>
                              {puesto.description} · {puesto.school}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}

                    <button
                      className="btn btn-accent"
                      type="submit"
                      disabled={compatibleOwnPosts.length === 0}
                    >
                      Me interesa
                    </button>
                  </form>
                )}
              </div>

              {compatibleOwnPosts.length === 0 ? (
                <p className="help">
                  No tenés un puesto publicado disponible para ofrecer con este
                  PID.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
