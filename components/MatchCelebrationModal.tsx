"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

type MatchCelebration = {
  my_post_id: string;
  other_post_id: string;
  other_full_name: string;
  other_pid: string;
  other_district: string;
};

type MatchCelebrationModalProps = {
  matches: MatchCelebration[];
};

function getMatchKey(
  myPostId: string,
  otherPostId: string
) {
  return [myPostId, otherPostId]
    .sort()
    .join("--");
}

export function MatchCelebrationModal({
  matches,
}: MatchCelebrationModalProps) {
  const searchParams = useSearchParams();

  const requestedMatch =
    searchParams.get("match");

  const [activeMatch, setActiveMatch] =
    useState<MatchCelebration | null>(
      null
    );

  const matchesWithKeys = useMemo(
    () =>
      matches.map((match) => ({
        ...match,
        matchKey: getMatchKey(
          match.my_post_id,
          match.other_post_id
        ),
      })),
    [matches]
  );

  useEffect(() => {
    if (matchesWithKeys.length === 0) {
      return;
    }

    const matchFromLink =
      requestedMatch
        ? matchesWithKeys.find(
            (match) =>
              match.matchKey ===
              requestedMatch
          )
        : null;

    if (matchFromLink) {
      setActiveMatch(matchFromLink);

      return;
    }

    const unseenMatch =
      matchesWithKeys.find(
        (match) => {
          const storageKey =
            `permutas-match-seen:${match.matchKey}`;

          return (
            window.localStorage.getItem(
              storageKey
            ) !== "true"
          );
        }
      );

    if (unseenMatch) {
      setActiveMatch(unseenMatch);
    }
  }, [
    matchesWithKeys,
    requestedMatch,
  ]);

  useEffect(() => {
    if (!activeMatch) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [activeMatch]);

  function closeModal() {
    if (activeMatch) {
      const matchKey = getMatchKey(
        activeMatch.my_post_id,
        activeMatch.other_post_id
      );

      window.localStorage.setItem(
        `permutas-match-seen:${matchKey}`,
        "true"
      );
    }

    setActiveMatch(null);
  }

  function viewMatch() {
    closeModal();

    window.setTimeout(() => {
      document
        .getElementById("coincidencias")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  if (!activeMatch) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-modal-title"
      onClick={closeModal}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background:
          "rgba(20, 35, 50, 0.72)",
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 24,
          padding: 32,
          background: "#f3efdc",
          boxShadow:
            "0 24px 70px rgba(0, 0, 0, 0.28)",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            fontSize: 58,
            lineHeight: 1,
            marginBottom: 18,
          }}
        >
          🎉
        </div>

        <span className="eyebrow">
          ¡Nueva coincidencia!
        </span>

        <h2
          id="match-modal-title"
          style={{
            marginTop: 10,
            color: "#24496e",
          }}
        >
          ¡Tenemos un match!
        </h2>

        <p
          style={{
            marginTop: 14,
            fontSize: 17,
            lineHeight: 1.6,
          }}
        >
          Vos y{" "}
          <strong>
            {activeMatch.other_full_name}
          </strong>{" "}
          manifestaron interés en avanzar
          con una posible permuta.
        </p>

        <div
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 16,
            background: "#ffffff",
          }}
        >
          <strong>
            PID {activeMatch.other_pid}
          </strong>

          <p
            style={{
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            Distrito de{" "}
            {activeMatch.other_district}
          </p>
        </div>

        <p
          className="help"
          style={{
            marginTop: 18,
          }}
        >
          Ya está habilitado el contacto
          por WhatsApp.
        </p>

        <div
          className="hero-actions"
          style={{
            justifyContent: "center",
            marginTop: 22,
          }}
        >
          <button
            className="btn btn-ghost"
            type="button"
            onClick={closeModal}
          >
            Cerrar
          </button>

          <button
            className="btn btn-accent"
            type="button"
            onClick={viewMatch}
          >
            Ver coincidencia
          </button>
        </div>
      </div>
    </div>
  );
}
