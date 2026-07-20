import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PanelHeader } from "@/components/PanelHeader";
import { PreferredDistrictsForm } from "@/components/PreferredDistrictsForm";
import { PuestoManager } from "@/components/PuestoManager";
import { CopyMatchSummaryButton } from "@/components/CopyMatchSummaryButton";
import type { Puesto } from "@/lib/types";
import {
  createInterest,
  dismissOffer,
  withdrawInterest,
} from "./actions";

type Profile = {
  full_name: string;
  preferred_districts: string[] | null;
};

type InterestSummary = {
  target_post_id: string;
  offered_post_id: string;
  status: string;
};

type MatchRecord = {
  my_post_id: string;
  my_description: string;
  my_pid: string;
  my_school: string;
  my_district: string;
  my_schedule: Puesto["schedule"];

  other_post_id: string;
  other_description: string;
  other_pid: string;
  other_school: string;
  other_district: string;
  other_schedule: Puesto["schedule"];

  other_full_name: string;
  other_phone: string;
  other_email: string;
  matched_at: string;
};

export default async function PanelPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: puestos }] =
    await Promise.all([
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
        .order("created_at", {
          ascending: false,
        }),
    ]);

  const safeProfile = (
    profile ?? {
      full_name: user.email ?? "Docente",
      preferred_districts: [],
    }
  ) as Profile;

  const myPuestos = (puestos ?? []) as Puesto[];

  const pids = [
    ...new Set(
      myPuestos.map((puesto) => puesto.pid)
    ),
  ];

  let offered: (
    Puesto & {
      user_id?: string;
    }
  )[] = [];

  if (pids.length > 0) {
    const { data } = await supabase
      .from("puestos")
      .select(
        "id, user_id, description, pid, school, district, schedule, status, created_at"
      )
      .in("pid", pids)
      .neq("user_id", user.id)
      .eq("status", "published");

    offered = (data ?? []) as (
      Puesto & {
        user_id?: string;
      }
    )[];
  }

  const { data: interests } = await supabase
    .from("interests")
    .select(
      "target_post_id, offered_post_id, status"
    )
    .eq("requester_user_id", user.id)
    .eq("status", "active");

  const activeInterests = (
    interests ?? []
  ) as InterestSummary[];

  const { data: dismissedOffers } =
    await supabase
      .from("dismissed_offers")
      .select("target_post_id")
      .eq("user_id", user.id);

  const dismissedOfferIds = new Set(
    (dismissedOffers ?? []).map(
      (item) => item.target_post_id
    )
  );

  const visibleOffers = offered.filter(
    (item) =>
      !dismissedOfferIds.has(item.id)
  );

  const {
    data: matchesData,
    error: matchesError,
  } = await supabase.rpc("get_my_matches");

  if (matchesError) {
    console.error(
      "No se pudieron cargar los matches:",
      matchesError.message
    );
  }

  const matches = (
    matchesData ?? []
  ) as MatchRecord[];

  const preferred =
    safeProfile.preferred_districts ?? [];

  const preferredOffers =
    visibleOffers.filter((item) =>
      preferred.includes(item.district)
    );

  const otherOffers =
    visibleOffers.filter(
      (item) =>
        !preferred.includes(item.district)
    );

  return (
    <>
      <PanelHeader
        fullName={safeProfile.full_name}
      />

      <main className="shell panel-grid">
        <aside className="sidebar">
          <section className="card">
            <h3>Tu perfil de búsqueda</h3>

            <PreferredDistrictsForm
              initialDistricts={preferred}
            />
          </section>

          <section className="card">
            <h3>Cómo se ordenan</h3>

            <p className="help">
              La app busca todos los
              ofrecimientos con tus mismos
              PID. Primero muestra los
              distritos preferidos y luego
              el resto.
            </p>
          </section>
        </aside>

        <div className="content">
          <section className="card">
            <span className="eyebrow">
              Panel inicial
            </span>

            <h2>
              Tu espacio de permutas
            </h2>

            <div className="stat-row">
              <div className="stat">
                <strong>
                  {myPuestos.length}
                </strong>

                <span>
                  Puestos cargados
                </span>
              </div>

              <div className="stat">
                <strong>
                  {visibleOffers.length}
                </strong>

                <span>
                  Ofrecimientos con tus PID
                </span>
              </div>

              <div className="stat">
                <strong>
                  {preferredOffers.length}
                </strong>

                <span>
                  En distritos preferidos
                </span>
              </div>

              <div className="stat">
                <strong>
                  {matches.length}
                </strong>

                <span>Matches</span>
              </div>
            </div>
          </section>

          <MatchSection
            matches={matches}
          />

          <PuestoManager
            initialPuestos={myPuestos}
          />

          <section className="card">
            <h2>Posibles permutas</h2>

            {pids.length === 0 ? (
              <div className="empty">
                Cargá al menos un puesto
                para empezar a buscar
                ofrecimientos por PID.
              </div>
            ) : visibleOffers.length ===
              0 ? (
              <div className="empty">
                No quedan ofrecimientos
                visibles con los códigos
                PID que cargaste.
              </div>
            ) : (
              <>
                <OfferSection
                  title="En tus distritos preferidos"
                  offers={preferredOffers}
                  myPuestos={myPuestos}
                  activeInterests={
                    activeInterests
                  }
                  preferred
                />

                <OfferSection
                  title="Otras posibilidades"
                  offers={otherOffers}
                  myPuestos={myPuestos}
                  activeInterests={
                    activeInterests
                  }
                />
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function formatSchedule(
  schedule: Puesto["schedule"]
) {
  return schedule
    .map(
      (item) =>
        `${item.day} de ${item.from} a ${item.to}`
    )
    .join(", ");
}

function MatchSection({
  matches,
}: {
  matches: MatchRecord[];
}) {
  if (matches.length === 0) {
    return (
      <section className="card">
        <span className="eyebrow">
          Matches
        </span>

        <h2>Tus coincidencias</h2>

        <div className="empty">
          Todavía no tenés matches. Los
          datos de contacto se compartirán
          cuando ambos docentes manifiesten
          interés.
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <span className="eyebrow">
        Matches
      </span>

      <h2>
        ¡Hay interés recíproco!
      </h2>

      <p className="help">
        Ambos docentes eligieron avanzar.
        Ya pueden comunicarse para
        conversar sobre la posible
        permuta.
      </p>

      <div
        className="job-list"
        style={{ marginTop: 20 }}
      >
        {matches.map((match) => {
          const summary = [
            "RESUMEN DE POSIBLE PERMUTA",
            "Docentes Brown",
            "",
            `Código PID: ${match.my_pid}`,
            "",
            "PUESTO QUE OFREZCO",
            `Descripción: ${match.my_description}`,
            `Institución: ${match.my_school}`,
            `Distrito: ${match.my_district}`,
            `Días y horarios: ${formatSchedule(
              match.my_schedule
            )}`,
            "",
            "PUESTO QUE RECIBIRÍA",
            `Descripción: ${match.other_description}`,
            `Institución: ${match.other_school}`,
            `Distrito: ${match.other_district}`,
            `Días y horarios: ${formatSchedule(
              match.other_schedule
            )}`,
            "",
            "CONTACTO DEL OTRO DOCENTE",
            `Nombre: ${match.other_full_name}`,
            `Celular: ${match.other_phone}`,
            `Correo: ${match.other_email}`,
            "",
            "Este resumen corresponde a una coincidencia generada en la aplicación de Permutas Docentes de Docentes Brown.",
          ].join("\n");

          return (
            <article
              className="job-item"
              key={`${match.my_post_id}-${match.other_post_id}`}
            >
              <div className="job-item-top">
                <div>
                  <span className="badge badge-preferred">
                    ¡Hay match!
                  </span>

                  <h3
                    className="job-title"
                    style={{
                      marginTop: 10,
                    }}
                  >
                    {match.other_full_name}
                  </h3>

                  <p className="job-sub">
                    Match por el código PID{" "}
                    {match.other_pid}
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                }}
              >
                <h3>Vos ofrecés</h3>

                <p>
                  <strong>
                    {match.my_description}
                  </strong>
                </p>

                <p className="job-sub">
                  {match.my_school} ·{" "}
                  {match.my_district}
                </p>

                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  {match.my_schedule.map(
                    (item, index) => (
                      <span
                        className="schedule-chip"
                        key={`my-${match.my_post_id}-${index}`}
                      >
                        {item.day}:{" "}
                        {item.from}–{item.to}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                }}
              >
                <h3>Recibirías</h3>

                <p>
                  <strong>
                    {match.other_description}
                  </strong>
                </p>

                <p className="job-sub">
                  {match.other_school} ·{" "}
                  {match.other_district}
                </p>

                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  {match.other_schedule.map(
                    (item, index) => (
                      <span
                        className="schedule-chip"
                        key={`other-${match.other_post_id}-${index}`}
                      >
                        {item.day}:{" "}
                        {item.from}–{item.to}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                }}
              >
                <h3>
                  Datos de contacto
                </h3>

                <p>
                  <strong>
                    Celular:
                  </strong>{" "}
                  <a
                    href={`tel:${match.other_phone}`}
                  >
                    {match.other_phone}
                  </a>
                </p>

                <p>
                  <strong>
                    Correo:
                  </strong>{" "}
                  <a
                    href={`mailto:${match.other_email}`}
                  >
                    {match.other_email}
                  </a>
                </p>
              </div>

              <div className="hero-actions">
                <a
                  className="btn btn-ghost"
                  href={`tel:${match.other_phone}`}
                >
                  Llamar
                </a>

                <a
                  className="btn btn-ghost"
                  href={`mailto:${match.other_email}`}
                >
                  Enviar correo
                </a>

                <CopyMatchSummaryButton
                  summary={summary}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
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
  if (offers.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h3>{title}</h3>

      <div className="job-list">
        {offers.map((offer) => {
          const compatibleOwnPosts =
            myPuestos.filter(
              (puesto) =>
                puesto.pid === offer.pid &&
                puesto.status ===
                  "published"
            );

          const existingInterest =
            activeInterests.find(
              (interest) =>
                interest.target_post_id ===
                offer.id
            );

          return (
            <article
              className="job-item"
              key={offer.id}
            >
              <div className="job-item-top">
                <div>
                  <h3 className="job-title">
                    {offer.description}
                  </h3>

                  <p className="job-sub">
                    PID {offer.pid} ·{" "}
                    {offer.school} ·{" "}
                    {offer.district}
                  </p>
                </div>

                {preferred ? (
                  <span className="badge badge-preferred">
                    Preferido
                  </span>
                ) : null}
              </div>

              <div
                style={{
                  marginTop: 12,
                }}
              >
                {offer.schedule.map(
                  (item, index) => (
                    <span
                      className="schedule-chip"
                      key={`${offer.id}-${index}`}
                    >
                      {item.day}:{" "}
                      {item.from}–{item.to}
                    </span>
                  )
                )}
              </div>

              <div className="hero-actions">
                {existingInterest ? (
                  <>
                    <span className="badge badge-preferred">
                      Interés enviado
                    </span>

                    <form
                      action={
                        withdrawInterest
                      }
                    >
                      <input
                        type="hidden"
                        name="target_post_id"
                        value={
                          existingInterest.target_post_id
                        }
                      />

                      <input
                        type="hidden"
                        name="offered_post_id"
                        value={
                          existingInterest.offered_post_id
                        }
                      />

                      <button
                        className="btn btn-ghost"
                        type="submit"
                      >
                        Retirar interés
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <form
                      action={dismissOffer}
                    >
                      <input
                        type="hidden"
                        name="target_post_id"
                        value={offer.id}
                      />

                      <button
                        className="btn btn-ghost"
                        type="submit"
                      >
                        No me sirve
                      </button>
                    </form>

                    <form
                      action={createInterest}
                    >
                      <input
                        type="hidden"
                        name="target_post_id"
                        value={offer.id}
                      />

                      {compatibleOwnPosts.length ===
                      1 ? (
                        <input
                          type="hidden"
                          name="offered_post_id"
                          value={
                            compatibleOwnPosts[0]
                              .id
                          }
                        />
                      ) : compatibleOwnPosts.length >
                        1 ? (
                        <label>
                          <span className="help">
                            Elegí cuál de tus
                            puestos ofrecés
                          </span>

                          <select
                            name="offered_post_id"
                            required
                          >
                            <option value="">
                              Seleccionar puesto
                            </option>

                            {compatibleOwnPosts.map(
                              (puesto) => (
                                <option
                                  key={puesto.id}
                                  value={puesto.id}
                                >
                                  {
                                    puesto.description
                                  }{" "}
                                  · {puesto.school}
                                </option>
                              )
                            )}
                          </select>
                        </label>
                      ) : null}

                      <button
                        className="btn btn-accent"
                        type="submit"
                        disabled={
                          compatibleOwnPosts.length ===
                          0
                        }
                      >
                        Me interesa
                      </button>
                    </form>
                  </>
                )}
              </div>

              {compatibleOwnPosts.length ===
              0 ? (
                <p className="help">
                  No tenés un puesto
                  publicado disponible para
                  ofrecer con este PID.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
