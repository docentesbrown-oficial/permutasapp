"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

export function AppOpeningExperience() {
  const [showSplash, setShowSplash] =
    useState(true);

  useEffect(() => {
    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    document.body.style.overflow =
      "hidden";

    const timer =
      window.setTimeout(
        () => {
          setShowSplash(false);
          document.body.style.overflow =
            "";
        },
        reducedMotion ? 350 : 2400
      );

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow =
        "";
    };
  }, []);

  return (
    <main className="opening-experience">
      <section
        className={`splash-screen ${
          showSplash
            ? "splash-visible"
            : "splash-hidden"
        }`}
        aria-hidden={!showSplash}
      >
        <div className="splash-decoration decoration-one" />
        <div className="splash-decoration decoration-two" />

        <div className="splash-content">
          <div className="splash-mark">
            <span className="mark-line line-one" />
            <span className="mark-line line-two" />
            <span className="mark-dot" />
          </div>

          <div className="splash-text">
            <span className="splash-brand">
              DOCENTES BROWN
            </span>

            <h1>
              Permutas
              <strong>
                Docentes
              </strong>
            </h1>

            <p>
              Encontrar tu próximo destino
              puede ser más simple.
            </p>
          </div>

          <div className="loading-line">
            <span />
          </div>
        </div>
      </section>

      <section
        className={`welcome-canvas ${
          showSplash
            ? "canvas-waiting"
            : "canvas-visible"
        }`}
      >
        <div className="welcome-background-shape shape-one" />
        <div className="welcome-background-shape shape-two" />

        <div className="welcome-shell">
          <header className="welcome-header">
            <div className="welcome-brand">
              <span>
                DOCENTES BROWN
              </span>

              <strong>
                Permutas Docentes
              </strong>
            </div>

            <span className="welcome-label">
              Provincia de Buenos Aires
            </span>
          </header>

          <div className="welcome-hero">
            <span className="welcome-eyebrow">
              Una herramienta entre docentes
            </span>

            <h2>
              Encontrá una permuta sin
              publicar tus datos.
            </h2>

            <p>
              Cargás tu ofrecimiento, revisás
              coincidencias y elegís cuáles te
              interesan. El contacto se comparte
              solamente cuando ambas personas
              están de acuerdo.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">
                01
              </div>

              <div>
                <h3>
                  Publicá lo que ofrecés
                </h3>

                <p>
                  Cargá tu cargo, curso, módulos
                  u horas titulares junto con su
                  código PID.
                </p>
              </div>
            </article>

            <article className="step-card">
              <div className="step-number">
                02
              </div>

              <div>
                <h3>
                  Revisá las coincidencias
                </h3>

                <p>
                  La app muestra ofrecimientos
                  con el mismo PID y prioriza
                  tus distritos preferidos.
                </p>
              </div>
            </article>

            <article className="step-card">
              <div className="step-number">
                03
              </div>

              <div>
                <h3>
                  Elegí con tranquilidad
                </h3>

                <p>
                  Marcá si te interesa. Tus datos
                  siguen privados hasta que el
                  interés sea recíproco.
                </p>
              </div>
            </article>
          </div>

          <section className="privacy-card">
            <div className="privacy-icon">
              ✓
            </div>

            <div>
              <span>
                Contacto protegido
              </span>

              <p>
                El teléfono se habilita solamente
                cuando hay una coincidencia real
                entre los dos docentes.
              </p>
            </div>
          </section>

          <div className="welcome-actions">
            <Link
              href="/login"
              className="enter-app-button"
            >
              <span>
                Ingresar a la APP
              </span>

              <strong>
                →
              </strong>
            </Link>

            <p>
              ¿Todavía no tenés cuenta?{" "}
              <Link href="/registro">
                Crear una cuenta
              </Link>
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .opening-experience {
          min-height: 100svh;
          background: #f3efdc;
          color: #24496e;
        }

        .splash-screen {
          position: fixed;
          z-index: 1000;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #24496e;
          color: #ffffff;
          transition:
            opacity 650ms ease,
            visibility 650ms ease;
        }

        .splash-visible {
          opacity: 1;
          visibility: visible;
        }

        .splash-hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .splash-decoration {
          position: absolute;
          border: 1px solid
            rgba(243, 239, 220, 0.12);
          border-radius: 50%;
          animation:
            decorationFloat 5s ease-in-out
            infinite;
        }

        .decoration-one {
          width: 380px;
          height: 380px;
          top: -170px;
          right: -130px;
        }

        .decoration-two {
          width: 270px;
          height: 270px;
          bottom: -130px;
          left: -100px;
          animation-delay: 900ms;
        }

        .splash-content {
          position: relative;
          z-index: 2;
          width: min(88%, 430px);
          text-align: center;
        }

        .splash-mark {
          position: relative;
          width: 86px;
          height: 86px;
          margin: 0 auto 25px;
          animation:
            markEntrance 900ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            both;
        }

        .mark-line {
          position: absolute;
          left: 12px;
          width: 62px;
          height: 15px;
          border-radius: 999px;
          background: #f3efdc;
          transform-origin: center;
        }

        .line-one {
          top: 25px;
          transform: rotate(45deg)
            scaleX(0);
          animation:
            lineOne 650ms 320ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            forwards;
        }

        .line-two {
          top: 47px;
          background: #da6863;
          transform: rotate(-45deg)
            scaleX(0);
          animation:
            lineTwo 650ms 530ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            forwards;
        }

        .mark-dot {
          position: absolute;
          top: 36px;
          left: 36px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          opacity: 0;
          transform: scale(0);
          animation:
            dotEntrance 500ms 900ms
            ease forwards;
        }

        .splash-text {
          animation:
            textEntrance 750ms 850ms
            ease both;
        }

        .splash-brand {
          display: block;
          color: #da6863;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .splash-text h1 {
          margin: 9px 0 13px;
          font-size: clamp(
            42px,
            9vw,
            64px
          );
          font-weight: 400;
          line-height: 0.93;
          letter-spacing: -2px;
        }

        .splash-text h1 strong {
          display: block;
          color: #f3efdc;
          font-weight: 900;
        }

        .splash-text p {
          max-width: 290px;
          margin: 0 auto;
          color:
            rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.5;
        }

        .loading-line {
          width: 180px;
          height: 3px;
          margin: 31px auto 0;
          overflow: hidden;
          border-radius: 999px;
          background:
            rgba(255, 255, 255, 0.12);
          animation:
            textEntrance 500ms 1200ms
            ease both;
        }

        .loading-line span {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          background: #da6863;
          transform: translateX(-100%);
          animation:
            loadingProgress 1200ms
            1150ms ease forwards;
        }

        .welcome-canvas {
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          padding: 24px 18px 42px;
          background:
            linear-gradient(
              180deg,
              #f3efdc 0%,
              #faf8f1 52%,
              #ffffff 100%
            );
          transition:
            opacity 700ms ease,
            transform 700ms ease;
        }

        .canvas-waiting {
          opacity: 0;
          transform: translateY(18px);
        }

        .canvas-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .welcome-background-shape {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(1px);
        }

        .shape-one {
          width: 330px;
          height: 330px;
          top: -180px;
          right: -140px;
          background:
            rgba(218, 104, 99, 0.14);
        }

        .shape-two {
          width: 260px;
          height: 260px;
          bottom: 80px;
          left: -170px;
          background:
            rgba(36, 73, 110, 0.08);
        }

        .welcome-shell {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 930px;
          margin: 0 auto;
        }

        .welcome-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .welcome-brand span {
          display: block;
          color: #da6863;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .welcome-brand strong {
          display: block;
          margin-top: 3px;
          color: #24496e;
          font-size: 17px;
        }

        .welcome-label {
          border: 1px solid
            rgba(36, 73, 110, 0.12);
          border-radius: 999px;
          padding: 7px 11px;
          background:
            rgba(255, 255, 255, 0.55);
          color: #65737d;
          font-size: 10px;
          font-weight: 800;
        }

        .welcome-hero {
          max-width: 690px;
          margin: 58px auto 0;
          text-align: center;
        }

        .welcome-eyebrow {
          display: block;
          color: #da6863;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .welcome-hero h2 {
          margin: 11px 0 16px;
          color: #24496e;
          font-size: clamp(
            38px,
            6vw,
            65px
          );
          line-height: 0.98;
          letter-spacing: -2px;
        }

        .welcome-hero p {
          max-width: 570px;
          margin: 0 auto;
          color: #687783;
          font-size: 16px;
          line-height: 1.65;
        }

        .steps-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 15px;
          margin-top: 47px;
        }

        .step-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-height: 176px;
          border: 1px solid
            rgba(36, 73, 110, 0.11);
          border-radius: 21px;
          padding: 21px;
          background:
            rgba(255, 255, 255, 0.78);
          box-shadow:
            0 16px 35px
            rgba(36, 73, 110, 0.07);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .step-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 20px 42px
            rgba(36, 73, 110, 0.11);
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex: 0 0 auto;
          border-radius: 14px;
          background: #24496e;
          color: #f3efdc;
          font-size: 12px;
          font-weight: 900;
        }

        .step-card h3 {
          margin: 2px 0 8px;
          color: #24496e;
          font-size: 17px;
          line-height: 1.15;
        }

        .step-card p {
          margin: 0;
          color: #6d7a84;
          font-size: 13px;
          line-height: 1.55;
        }

        .privacy-card {
          display: flex;
          align-items: center;
          gap: 15px;
          max-width: 610px;
          margin: 22px auto 0;
          border: 1px solid
            rgba(218, 104, 99, 0.18);
          border-radius: 18px;
          padding: 15px 17px;
          background:
            rgba(218, 104, 99, 0.07);
        }

        .privacy-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #da6863;
          color: #ffffff;
          font-size: 18px;
          font-weight: 900;
        }

        .privacy-card span {
          display: block;
          color: #24496e;
          font-size: 13px;
          font-weight: 900;
        }

        .privacy-card p {
          margin: 3px 0 0;
          color: #6d7a84;
          font-size: 12px;
          line-height: 1.45;
        }

        .welcome-actions {
          max-width: 430px;
          margin: 28px auto 0;
          text-align: center;
        }

        .enter-app-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          min-height: 58px;
          border-radius: 17px;
          padding: 0 18px 0 23px;
          background: #da6863;
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          text-decoration: none;
          box-shadow:
            0 13px 28px
            rgba(218, 104, 99, 0.27);
          transition:
            transform 170ms ease,
            box-shadow 170ms ease;
        }

        .enter-app-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 17px 34px
            rgba(218, 104, 99, 0.31);
        }

        .enter-app-button strong {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background:
            rgba(255, 255, 255, 0.17);
          font-size: 19px;
        }

        .welcome-actions p {
          margin: 14px 0 0;
          color: #71808a;
          font-size: 12px;
        }

        .welcome-actions p a {
          color: #24496e;
          font-weight: 900;
          text-underline-offset: 3px;
        }

        @keyframes markEntrance {
          from {
            opacity: 0;
            transform:
              scale(0.72)
              rotate(-12deg);
          }

          to {
            opacity: 1;
            transform:
              scale(1)
              rotate(0deg);
          }
        }

        @keyframes lineOne {
          to {
            transform:
              rotate(45deg)
              scaleX(1);
          }
        }

        @keyframes lineTwo {
          to {
            transform:
              rotate(-45deg)
              scaleX(1);
          }
        }

        @keyframes dotEntrance {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes textEntrance {
          from {
            opacity: 0;
            transform:
              translateY(12px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        @keyframes loadingProgress {
          to {
            transform: translateX(0);
          }
        }

        @keyframes decorationFloat {
          0%,
          100% {
            transform:
              translateY(0)
              scale(1);
          }

          50% {
            transform:
              translateY(14px)
              scale(1.03);
          }
        }

        @media (
          max-width: 720px
        ) {
          .welcome-canvas {
            padding-top: 18px;
          }

          .welcome-header {
            align-items: flex-start;
          }

          .welcome-label {
            max-width: 120px;
            text-align: center;
          }

          .welcome-hero {
            margin-top: 43px;
          }

          .welcome-hero h2 {
            font-size: 41px;
          }

          .welcome-hero p {
            font-size: 14px;
          }

          .steps-grid {
            grid-template-columns: 1fr;
            gap: 11px;
            margin-top: 33px;
          }

          .step-card {
            min-height: auto;
            padding: 17px;
          }

          .privacy-card {
            align-items: flex-start;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          *,
          *::before,
          *::after {
            animation-duration:
              1ms !important;
            animation-delay:
              0ms !important;
            transition-duration:
              1ms !important;
          }
        }
      `}</style>
    </main>
  );
}
