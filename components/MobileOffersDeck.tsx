"use client";

import {
  PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { Puesto } from "@/lib/types";
import {
  createInterest,
  dismissOffer,
} from "@/app/panel/actions";

type MobileOffersDeckProps = {
  fullName: string;
  preferredOffers: Puesto[];
  otherOffers: Puesto[];
  myPuestos: Puesto[];
  activeTargetPostIds: string[];
  matchesCount: number;
};

type MobileOffer = Puesto & {
  preferred: boolean;
};

type Decision =
  | "interested"
  | "dismissed"
  | null;

const SWIPE_THRESHOLD = 90;

function getFirstName(fullName: string) {
  return (
    fullName.trim().split(/\s+/)[0] ||
    "Docente"
  );
}

export function MobileOffersDeck({
  fullName,
  preferredOffers,
  otherOffers,
  myPuestos,
  activeTargetPostIds,
  matchesCount,
}: MobileOffersDeckProps) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [offsetX, setOffsetX] =
    useState(0);

  const [dragging, setDragging] =
    useState(false);

  const [decision, setDecision] =
    useState<Decision>(null);

  const [message, setMessage] =
    useState("");

  const [
    selectedOwnPostByOffer,
    setSelectedOwnPostByOffer,
  ] = useState<Record<string, string>>(
    {}
  );

  const [isPending, startTransition] =
    useTransition();

  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  const horizontalDrag =
    useRef(false);

  const offers = useMemo(() => {
    const activeIds = new Set(
      activeTargetPostIds
    );

    const preferredIds = new Set(
      preferredOffers.map(
        (offer) => offer.id
      )
    );

    const prioritized: MobileOffer[] =
      preferredOffers
        .filter(
          (offer) =>
            !activeIds.has(offer.id)
        )
        .map((offer) => ({
          ...offer,
          preferred: true,
        }));

    const remaining: MobileOffer[] =
      otherOffers
        .filter(
          (offer) =>
            !activeIds.has(offer.id) &&
            !preferredIds.has(offer.id)
        )
        .map((offer) => ({
          ...offer,
          preferred: false,
        }));

    return [
      ...prioritized,
      ...remaining,
    ];
  }, [
    activeTargetPostIds,
    otherOffers,
    preferredOffers,
  ]);

  const currentOffer =
    offers[currentIndex];

  const nextOffer =
    offers[currentIndex + 1];

  const compatibleOwnPosts =
    currentOffer
      ? myPuestos.filter(
          (puesto) =>
            puesto.pid ===
              currentOffer.pid &&
            puesto.status ===
              "published"
        )
      : [];

  const selectedOwnPostId =
    currentOffer
      ? selectedOwnPostByOffer[
          currentOffer.id
        ] ??
        compatibleOwnPosts[0]?.id ??
        ""
      : "";

  const rotation = offsetX / 18;

  const interestedOpacity =
    Math.min(
      Math.max(offsetX / 110, 0),
      1
    );

  const dismissedOpacity =
    Math.min(
      Math.max(-offsetX / 110, 0),
      1
    );

  function resetCard() {
    setOffsetX(0);
    setDragging(false);
    setDecision(null);
    horizontalDrag.current = false;
  }

  function advanceCard() {
    setCurrentIndex(
      (index) => index + 1
    );

    resetCard();
  }

  function animateDecision(
    direction: "left" | "right",
    action: () => void
  ) {
    const distance =
      typeof window === "undefined"
        ? 600
        : window.innerWidth + 220;

    setDragging(false);
    setDecision(
      direction === "right"
        ? "interested"
        : "dismissed"
    );

    setOffsetX(
      direction === "right"
        ? distance
        : -distance
    );

    window.setTimeout(() => {
      advanceCard();
      action();
    }, 230);
  }

  function markInterested() {
    if (
      !currentOffer ||
      isPending
    ) {
      return;
    }

    if (!selectedOwnPostId) {
      setMessage(
        "No tenés un puesto publicado disponible para ofrecer con este PID."
      );

      resetCard();
      return;
    }

    const offer = currentOffer;
    const offeredPostId =
      selectedOwnPostId;

    setMessage("");

    animateDecision(
      "right",
      () => {
        const formData =
          new FormData();

        formData.set(
          "target_post_id",
          offer.id
        );

        formData.set(
          "offered_post_id",
          offeredPostId
        );

        startTransition(() => {
          void createInterest(
            formData
          );
        });
      }
    );
  }

  function markDismissed() {
    if (
      !currentOffer ||
      isPending
    ) {
      return;
    }

    const offer = currentOffer;

    setMessage("");

    animateDecision(
      "left",
      () => {
        const formData =
          new FormData();

        formData.set(
          "target_post_id",
          offer.id
        );

        startTransition(() => {
          void dismissOffer(
            formData
          );
        });
      }
    );
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLElement>
  ) {
    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        "button, select, option, a"
      )
    ) {
      return;
    }

    pointerStartX.current =
      event.clientX;

    pointerStartY.current =
      event.clientY;

    horizontalDrag.current =
      false;

    setDragging(true);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (!dragging) {
      return;
    }

    const differenceX =
      event.clientX -
      pointerStartX.current;

    const differenceY =
      event.clientY -
      pointerStartY.current;

    if (
      !horizontalDrag.current &&
      Math.abs(differenceX) > 8
    ) {
      horizontalDrag.current =
        Math.abs(differenceX) >
        Math.abs(differenceY);
    }

    if (
      horizontalDrag.current
    ) {
      setOffsetX(differenceX);
    }
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (!dragging) {
      return;
    }

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    if (
      offsetX >=
      SWIPE_THRESHOLD
    ) {
      markInterested();
      return;
    }

    if (
      offsetX <=
      -SWIPE_THRESHOLD
    ) {
      markDismissed();
      return;
    }

    resetCard();
  }

  function showDesktopVersion() {
    window.location.href =
      "/panel?vista=escritorio";
  }

  return (
    <main className="mobile-discovery">
      <header className="mobile-topbar">
        <div>
          <span className="mobile-brand">
            DOCENTES BROWN
          </span>

          <h1>
            Hola,{" "}
            {getFirstName(fullName)}
          </h1>
        </div>

        <div
          className="mobile-match-count"
          aria-label={`${matchesCount} coincidencias`}
        >
          <span>Coincidencias</span>
          <strong>
            {matchesCount}
          </strong>
        </div>
      </header>

      <section className="mobile-intro">
        <div>
          <span className="mobile-eyebrow">
            Posibles permutas
          </span>

          <h2>
            Encontrá tu próxima
            coincidencia
          </h2>
        </div>

        <button
          className="desktop-version-button"
          type="button"
          onClick={
            showDesktopVersion
          }
        >
          Ver versión de escritorio
        </button>
      </section>

      <div className="mobile-progress">
        <span>
          {currentOffer
            ? `${currentIndex + 1} de ${offers.length}`
            : "Sin ofertas pendientes"}
        </span>

        <div>
          <i
            style={{
              width:
                offers.length > 0
                  ? `${Math.min(
                      ((currentIndex + 1) /
                        offers.length) *
                        100,
                      100
                    )}%`
                  : "100%",
            }}
          />
        </div>
      </div>

      <section className="mobile-deck">
        {nextOffer ? (
          <OfferCard
            offer={nextOffer}
            background
          />
        ) : null}

        {currentOffer ? (
          <article
            className={`mobile-offer-card ${
              dragging
                ? "is-dragging"
                : ""
            } ${
              decision
                ? `is-${decision}`
                : ""
            }`}
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              handlePointerUp
            }
            onPointerCancel={
              handlePointerUp
            }
            style={{
              transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
            }}
          >
            <div
              className="decision-stamp interested-stamp"
              style={{
                opacity:
                  interestedOpacity,
              }}
            >
              INTERESADO
            </div>

            <div
              className="decision-stamp dismissed-stamp"
              style={{
                opacity:
                  dismissedOpacity,
              }}
            >
              NO ME SIRVE
            </div>

            <OfferCardContent
              offer={currentOffer}
            />

            <div className="own-post-choice">
              <span>
                Tu puesto para esta
                oferta
              </span>

              {compatibleOwnPosts.length >
              1 ? (
                <select
                  value={
                    selectedOwnPostId
                  }
                  onChange={(event) =>
                    setSelectedOwnPostByOffer(
                      (current) => ({
                        ...current,
                        [currentOffer.id]:
                          event.target
                            .value,
                      })
                    )
                  }
                >
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
              ) : compatibleOwnPosts.length ===
                1 ? (
                <strong>
                  {
                    compatibleOwnPosts[0]
                      .description
                  }
                </strong>
              ) : (
                <strong className="mobile-warning">
                  No hay un puesto
                  publicado compatible
                </strong>
              )}
            </div>
          </article>
        ) : (
          <div className="mobile-empty-card">
            <div>✨</div>

            <h2>
              Ya viste todas las
              ofertas
            </h2>

            <p>
              Cuando aparezcan nuevas
              posibilidades con tus
              códigos PID, se mostrarán
              acá.
            </p>

            <button
              className="desktop-version-button"
              type="button"
              onClick={
                showDesktopVersion
              }
            >
              Ir al panel completo
            </button>
          </div>
        )}
      </section>

      {message ? (
        <p
          className="mobile-feedback"
          role="alert"
        >
          {message}
        </p>
      ) : null}

      {currentOffer ? (
        <>
          <div className="mobile-actions">
            <button
              className="swipe-action dislike-action"
              type="button"
              aria-label="No me interesa"
              onClick={
                markDismissed
              }
              disabled={isPending}
            >
              ×
            </button>

            <div className="swipe-help">
              <span>
                Deslizá para elegir
              </span>

              <strong>
                ← No · Sí →
              </strong>
            </div>

            <button
              className="swipe-action like-action"
              type="button"
              aria-label="Me interesa"
              onClick={
                markInterested
              }
              disabled={
                isPending ||
                compatibleOwnPosts.length ===
                  0
              }
            >
              ♥
            </button>
          </div>

          <p className="mobile-privacy">
            Los datos de contacto se
            habilitan únicamente cuando
            el interés es recíproco.
          </p>
        </>
      ) : null}

      <style jsx>{`
        .mobile-discovery {
          min-height: 100svh;
          padding: 18px 16px 28px;
          overflow: hidden;
          background:
            radial-gradient(
              circle at top right,
              rgba(218, 104, 99, 0.18),
              transparent 30%
            ),
            linear-gradient(
              180deg,
              #f3efdc 0%,
              #f9f7ef 55%,
              #ffffff 100%
            );
          color: #21384d;
        }

        .mobile-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          max-width: 520px;
          margin: 0 auto;
        }

        .mobile-brand {
          display: block;
          color: #da6863;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .mobile-topbar h1 {
          margin: 4px 0 0;
          color: #24496e;
          font-size: 23px;
          line-height: 1.1;
        }

        .mobile-match-count {
          min-width: 86px;
          padding: 8px 12px;
          border: 1px solid
            rgba(36, 73, 110, 0.12);
          border-radius: 16px;
          background: rgba(
            255,
            255,
            255,
            0.82
          );
          text-align: center;
          box-shadow: 0 8px 22px
            rgba(36, 73, 110, 0.08);
        }

        .mobile-match-count span {
          display: block;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .mobile-match-count strong {
          display: block;
          margin-top: 1px;
          color: #da6863;
          font-size: 23px;
        }

        .mobile-intro {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 12px;
          max-width: 520px;
          margin: 23px auto 0;
        }

        .mobile-eyebrow {
          color: #da6863;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .mobile-intro h2 {
          max-width: 245px;
          margin: 5px 0 0;
          color: #24496e;
          font-size: 24px;
          line-height: 1.05;
        }

        .desktop-version-button {
          border: 0;
          padding: 8px 10px;
          background: transparent;
          color: #24496e;
          font-size: 11px;
          font-weight: 800;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }

        .mobile-progress {
          max-width: 520px;
          margin: 16px auto 10px;
        }

        .mobile-progress span {
          display: block;
          margin-bottom: 6px;
          color: #667784;
          font-size: 11px;
          font-weight: 700;
          text-align: right;
        }

        .mobile-progress div {
          height: 5px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(
            36,
            73,
            110,
            0.1
          );
        }

        .mobile-progress i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #24496e,
            #da6863
          );
          transition: width 220ms ease;
        }

        .mobile-deck {
          position: relative;
          width: 100%;
          max-width: 520px;
          height: min(
            57svh,
            570px
          );
          min-height: 440px;
          margin: 0 auto;
        }

        .mobile-offer-card {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid
            rgba(36, 73, 110, 0.14);
          border-radius: 28px;
          background: #ffffff;
          box-shadow: 0 22px 55px
            rgba(36, 73, 110, 0.2);
          touch-action: pan-y;
          user-select: none;
          transition:
            transform 230ms ease,
            opacity 230ms ease;
          will-change: transform;
        }

        .mobile-offer-card.is-dragging {
          transition: none;
          cursor: grabbing;
        }

        .mobile-offer-card.is-interested,
        .mobile-offer-card.is-dismissed {
          opacity: 0.65;
        }

        .decision-stamp {
          position: absolute;
          z-index: 5;
          top: 30px;
          border: 4px solid
            currentColor;
          border-radius: 9px;
          padding: 7px 10px;
          background: rgba(
            255,
            255,
            255,
            0.9
          );
          font-size: 21px;
          font-weight: 950;
          letter-spacing: 1px;
          pointer-events: none;
        }

        .interested-stamp {
          left: 24px;
          color: #23855a;
          transform: rotate(-9deg);
        }

        .dismissed-stamp {
          right: 24px;
          color: #da6863;
          transform: rotate(9deg);
        }

        .own-post-choice {
          margin-top: auto;
          padding: 15px 18px 18px;
          border-top: 1px solid
            rgba(36, 73, 110, 0.1);
          background: #faf9f4;
        }

        .own-post-choice > span {
          display: block;
          margin-bottom: 7px;
          color: #6f7c85;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .own-post-choice strong {
          display: block;
          color: #24496e;
          font-size: 13px;
          line-height: 1.35;
        }

        .own-post-choice select {
          width: 100%;
          min-height: 42px;
          border: 1px solid
            rgba(36, 73, 110, 0.2);
          border-radius: 11px;
          padding: 0 10px;
          background: #ffffff;
          color: #24496e;
          font-size: 13px;
          font-weight: 700;
        }

        .mobile-warning {
          color: #b44944 !important;
        }

        .mobile-empty-card {
          display: flex;
          height: 100%;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px dashed
            rgba(36, 73, 110, 0.24);
          border-radius: 28px;
          padding: 30px;
          background: rgba(
            255,
            255,
            255,
            0.75
          );
          text-align: center;
        }

        .mobile-empty-card > div {
          font-size: 44px;
        }

        .mobile-empty-card h2 {
          margin: 12px 0 8px;
          color: #24496e;
        }

        .mobile-empty-card p {
          max-width: 310px;
          margin: 0;
          color: #60717d;
          line-height: 1.55;
        }

        .mobile-feedback {
          max-width: 520px;
          margin: 10px auto 0;
          color: #b44944;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
        }

        .mobile-actions {
          display: grid;
          grid-template-columns:
            64px 1fr 64px;
          align-items: center;
          gap: 14px;
          max-width: 390px;
          margin: 15px auto 0;
        }

        .swipe-action {
          width: 62px;
          height: 62px;
          border: 0;
          border-radius: 50%;
          background: #ffffff;
          font-size: 31px;
          font-weight: 700;
          box-shadow: 0 10px 26px
            rgba(36, 73, 110, 0.17);
          cursor: pointer;
        }

        .swipe-action:disabled {
          opacity: 0.42;
          cursor: not-allowed;
        }

        .dislike-action {
          color: #da6863;
        }

        .like-action {
          color: #23855a;
        }

        .swipe-help {
          text-align: center;
        }

        .swipe-help span,
        .swipe-help strong {
          display: block;
        }

        .swipe-help span {
          color: #7a878f;
          font-size: 10px;
          font-weight: 700;
        }

        .swipe-help strong {
          margin-top: 3px;
          color: #24496e;
          font-size: 13px;
        }

        .mobile-privacy {
          max-width: 360px;
          margin: 12px auto 0;
          color: #7a878f;
          font-size: 10px;
          line-height: 1.4;
          text-align: center;
        }

        @media (
          max-height: 720px
        ) {
          .mobile-intro {
            margin-top: 14px;
          }

          .mobile-intro h2 {
            font-size: 21px;
          }

          .mobile-deck {
            height: 52svh;
            min-height: 390px;
          }

          .mobile-actions {
            margin-top: 10px;
          }
        }
      `}</style>
    </main>
  );
}

function OfferCard({
  offer,
  background = false,
}: {
  offer: MobileOffer;
  background?: boolean;
}) {
  return (
    <article
      className={`mobile-offer-card ${
        background
          ? "background-card"
          : ""
      }`}
      aria-hidden={background}
    >
      <OfferCardContent
        offer={offer}
      />

      <style jsx>{`
        .mobile-offer-card {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid
            rgba(36, 73, 110, 0.14);
          border-radius: 28px;
          background: #ffffff;
          box-shadow: 0 18px 44px
            rgba(36, 73, 110, 0.16);
        }

        .background-card {
          transform:
            translateY(12px)
            scale(0.96);
          opacity: 0.72;
        }
      `}</style>
    </article>
  );
}

function OfferCardContent({
  offer,
}: {
  offer: MobileOffer;
}) {
  return (
    <>
      <div className="card-hero">
        <div className="card-hero-top">
          <span
            className={
              offer.preferred
                ? "priority-badge"
                : "regular-badge"
            }
          >
            {offer.preferred
              ? "★ Distrito prioritario"
              : "Otra posibilidad"}
          </span>

          <span className="pid-badge">
            PID {offer.pid}
          </span>
        </div>

        <div className="district-mark">
          {offer.district
            .trim()
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="card-heading">
          <span>
            Distrito
          </span>

          <h2>
            {offer.district}
          </h2>
        </div>
      </div>

      <div className="card-body">
        <span className="card-label">
          Puesto ofrecido
        </span>

        <h3>
          {offer.description}
        </h3>

        <div className="school-box">
          <span>Institución</span>
          <strong>
            {offer.school}
          </strong>
        </div>

        <div className="schedule-area">
          <span className="card-label">
            Días y horarios
          </span>

          <div>
            {offer.schedule.map(
              (item, index) => (
                <span
                  className="schedule-pill"
                  key={`${offer.id}-${index}`}
                >
                  <strong>
                    {item.day}
                  </strong>

                  {item.from}–{item.to}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .card-hero {
          position: relative;
          min-height: 180px;
          overflow: hidden;
          padding: 20px;
          background:
            linear-gradient(
              135deg,
              #24496e,
              #315e88 65%,
              #da6863
            );
          color: #ffffff;
        }

        .card-hero::after {
          content: "";
          position: absolute;
          width: 210px;
          height: 210px;
          right: -80px;
          bottom: -105px;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.12
          );
        }

        .card-hero-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .priority-badge,
        .regular-badge,
        .pid-badge {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          border-radius: 999px;
          padding: 0 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.4px;
        }

        .priority-badge {
          background: #f3efdc;
          color: #24496e;
        }

        .regular-badge {
          background: rgba(
            255,
            255,
            255,
            0.16
          );
          color: #ffffff;
        }

        .pid-badge {
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.28
            );
          background: rgba(
            20,
            42,
            62,
            0.26
          );
          color: #ffffff;
        }

        .district-mark {
          position: absolute;
          right: 20px;
          bottom: -24px;
          color: rgba(
            255,
            255,
            255,
            0.13
          );
          font-size: 145px;
          font-weight: 950;
          line-height: 1;
        }

        .card-heading {
          position: absolute;
          z-index: 2;
          left: 20px;
          right: 20px;
          bottom: 22px;
        }

        .card-heading span {
          display: block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.76;
        }

        .card-heading h2 {
          max-width: 84%;
          margin: 5px 0 0;
          color: #ffffff;
          font-size: 30px;
          line-height: 1.03;
        }

        .card-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 20px 12px;
        }

        .card-label {
          display: block;
          color: #da6863;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .card-body h3 {
          margin: 7px 0 15px;
          color: #24496e;
          font-size: 22px;
          line-height: 1.12;
        }

        .school-box {
          border-radius: 15px;
          padding: 13px 14px;
          background: #f3efdc;
        }

        .school-box span,
        .school-box strong {
          display: block;
        }

        .school-box span {
          color: #7c7b72;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .school-box strong {
          margin-top: 4px;
          color: #24496e;
          font-size: 14px;
          line-height: 1.35;
        }

        .schedule-area {
          margin-top: 17px;
        }

        .schedule-area > div {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 8px;
        }

        .schedule-pill {
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
          border: 1px solid
            rgba(36, 73, 110, 0.12);
          border-radius: 11px;
          padding: 7px 10px;
          background: #ffffff;
          color: #526675;
          font-size: 11px;
        }

        .schedule-pill strong {
          color: #24496e;
          font-size: 11px;
        }
      `}</style>
    </>
  );
}
