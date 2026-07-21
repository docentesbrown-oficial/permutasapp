"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";
import { DISTRITOS_PBA } from "@/data/distritos";
import type {
  ScheduleItem,
} from "@/lib/types";

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const EMPTY_SCHEDULE: ScheduleItem = {
  day: "Lunes",
  from: "08:00",
  to: "10:00",
};

type FormState = {
  description: string;
  pid: string;
  school: string;
  district: string;
  schedule: ScheduleItem[];
};

const EMPTY_FORM: FormState = {
  description: "",
  pid: "",
  school: "",
  district: "Almirante Brown",
  schedule: [
    {
      ...EMPTY_SCHEDULE,
    },
  ],
};

export function MobileNewPuestoForm() {
  const router = useRouter();

  const [form, setForm] =
    useState<FormState>(
      EMPTY_FORM
    );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  function updateSchedule(
    index: number,
    key: keyof ScheduleItem,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      schedule:
        current.schedule.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [key]: value,
                }
              : item
        ),
    }));
  }

  function addSchedule() {
    setForm((current) => ({
      ...current,
      schedule: [
        ...current.schedule,
        {
          ...EMPTY_SCHEDULE,
        },
      ],
    }));
  }

  function removeSchedule(
    index: number
  ) {
    setForm((current) => ({
      ...current,
      schedule:
        current.schedule.length === 1
          ? current.schedule
          : current.schedule.filter(
              (_, itemIndex) =>
                itemIndex !== index
            ),
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/puestos",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "No pudimos publicar el puesto."
        );
      }

      router.push(
        "/panel/movil"
      );

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );

      setLoading(false);
    }
  }

  function goBack() {
    router.push(
      "/panel/movil"
    );
  }

  return (
    <main className="mobile-new-post">
      <header className="mobile-new-header">
        <button
          type="button"
          className="back-button"
          onClick={goBack}
          aria-label="Volver"
        >
          ←
        </button>

        <div>
          <span>
            DOCENTES BROWN
          </span>

          <h1>
            Ofrecer nuevo curso
          </h1>
        </div>
      </header>

      <section className="mobile-new-intro">
        <span>
          Nueva publicación
        </span>

        <h2>
          Contanos qué puesto querés
          ofrecer
        </h2>

        <p>
          La aplicación buscará
          coincidencias únicamente con
          otros puestos que tengan el
          mismo código PID.
        </p>
      </section>

      <form
        className="mobile-new-form"
        onSubmit={handleSubmit}
      >
        <label>
          <span>
            Cargo, módulos u horas
            cátedra
          </span>

          <input
            required
            value={
              form.description
            }
            onChange={(event) =>
              setForm({
                ...form,
                description:
                  event.target.value,
              })
            }
            placeholder="Ej.: 4 módulos titulares de Física"
          />
        </label>

        <label>
          <span>
            Código PID
          </span>

          <input
            required
            value={form.pid}
            onChange={(event) =>
              setForm({
                ...form,
                pid:
                  event.target.value,
              })
            }
            placeholder="Ej.: 123456"
            inputMode="numeric"
          />

          <small>
            Este código determina qué
            ofertas son compatibles.
          </small>
        </label>

        <label>
          <span>
            Escuela
          </span>

          <input
            required
            value={form.school}
            onChange={(event) =>
              setForm({
                ...form,
                school:
                  event.target.value,
              })
            }
            placeholder="Ej.: EES N.º 18"
          />
        </label>

        <label>
          <span>
            Distrito
          </span>

          <select
            value={form.district}
            onChange={(event) =>
              setForm({
                ...form,
                district:
                  event.target.value,
              })
            }
          >
            {DISTRITOS_PBA.map(
              (district) => (
                <option
                  key={district}
                  value={district}
                >
                  {district}
                </option>
              )
            )}
          </select>
        </label>

        <div className="schedule-section">
          <div className="schedule-heading">
            <div>
              <span>
                Días y horarios
              </span>

              <p>
                Podés agregar todos los
                días correspondientes.
              </p>
            </div>

            <button
              type="button"
              onClick={addSchedule}
            >
              + Día
            </button>
          </div>

          {form.schedule.map(
            (item, index) => (
              <div
                className="schedule-row"
                key={`${index}-${item.day}`}
              >
                <select
                  aria-label="Día"
                  value={item.day}
                  onChange={(event) =>
                    updateSchedule(
                      index,
                      "day",
                      event.target.value
                    )
                  }
                >
                  {DAYS.map(
                    (day) => (
                      <option
                        key={day}
                        value={day}
                      >
                        {day}
                      </option>
                    )
                  )}
                </select>

                <div className="time-row">
                  <label>
                    <span>
                      Desde
                    </span>

                    <input
                      type="time"
                      value={item.from}
                      onChange={(event) =>
                        updateSchedule(
                          index,
                          "from",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      Hasta
                    </span>

                    <input
                      type="time"
                      value={item.to}
                      onChange={(event) =>
                        updateSchedule(
                          index,
                          "to",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <button
                    className="remove-day"
                    type="button"
                    aria-label="Quitar día"
                    onClick={() =>
                      removeSchedule(index)
                    }
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {message ? (
          <div
            className="mobile-form-error"
            role="alert"
          >
            {message}
          </div>
        ) : null}

        <div className="mobile-form-actions">
          <button
            className="cancel-button"
            type="button"
            onClick={goBack}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            className="publish-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Publicando..."
              : "Publicar curso"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .mobile-new-post {
          min-height: 100svh;
          padding: 20px 16px 36px;
          background:
            radial-gradient(
              circle at top right,
              rgba(218, 104, 99, 0.18),
              transparent 31%
            ),
            linear-gradient(
              180deg,
              #f3efdc 0%,
              #ffffff 100%
            );
          color: #243746;
        }

        .mobile-new-header,
        .mobile-new-intro,
        .mobile-new-form {
          width: 100%;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        }

        .mobile-new-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .back-button {
          width: 44px;
          height: 44px;
          flex: 0 0 auto;
          border: 1px solid
            rgba(36, 73, 110, 0.14);
          border-radius: 50%;
          background: #ffffff;
          color: #24496e;
          font-size: 24px;
          cursor: pointer;
          box-shadow:
            0 8px 22px
            rgba(36, 73, 110, 0.1);
        }

        .mobile-new-header span,
        .mobile-new-intro > span,
        .mobile-new-form label > span,
        .schedule-heading span {
          display: block;
          color: #da6863;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .mobile-new-header h1 {
          margin: 4px 0 0;
          color: #24496e;
          font-size: 22px;
        }

        .mobile-new-intro {
          margin-top: 28px;
        }

        .mobile-new-intro h2 {
          margin: 7px 0 10px;
          color: #24496e;
          font-size: 29px;
          line-height: 1.06;
        }

        .mobile-new-intro p {
          margin: 0;
          color: #61717c;
          font-size: 14px;
          line-height: 1.55;
        }

        .mobile-new-form {
          display: grid;
          gap: 17px;
          margin-top: 24px;
          border: 1px solid
            rgba(36, 73, 110, 0.12);
          border-radius: 24px;
          padding: 20px;
          background:
            rgba(255, 255, 255, 0.94);
          box-shadow:
            0 18px 45px
            rgba(36, 73, 110, 0.13);
        }

        .mobile-new-form label {
          display: block;
        }

        .mobile-new-form input,
        .mobile-new-form select {
          width: 100%;
          min-height: 48px;
          margin-top: 7px;
          border: 1px solid
            rgba(36, 73, 110, 0.2);
          border-radius: 13px;
          padding: 0 13px;
          background: #ffffff;
          color: #24496e;
          font-size: 15px;
          outline: none;
        }

        .mobile-new-form input:focus,
        .mobile-new-form select:focus {
          border-color: #24496e;
          box-shadow:
            0 0 0 3px
            rgba(36, 73, 110, 0.1);
        }

        .mobile-new-form small {
          display: block;
          margin-top: 6px;
          color: #71808a;
          font-size: 11px;
          line-height: 1.4;
        }

        .schedule-section {
          border-top: 1px solid
            rgba(36, 73, 110, 0.1);
          padding-top: 18px;
        }

        .schedule-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .schedule-heading p {
          margin: 4px 0 0;
          color: #71808a;
          font-size: 11px;
        }

        .schedule-heading button {
          min-height: 38px;
          border: 0;
          border-radius: 999px;
          padding: 0 14px;
          background: #f3efdc;
          color: #24496e;
          font-weight: 800;
          cursor: pointer;
        }

        .schedule-row {
          margin-top: 14px;
          border: 1px solid
            rgba(36, 73, 110, 0.1);
          border-radius: 16px;
          padding: 12px;
          background: #faf9f4;
        }

        .schedule-row > select {
          margin-top: 0;
        }

        .time-row {
          display: grid;
          grid-template-columns:
            1fr 1fr 42px;
          align-items: end;
          gap: 8px;
          margin-top: 10px;
        }

        .time-row label span {
          color: #71808a;
          font-size: 9px;
        }

        .time-row input {
          min-height: 43px;
          margin-top: 5px;
          padding: 0 7px;
          font-size: 13px;
        }

        .remove-day {
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 12px;
          background:
            rgba(218, 104, 99, 0.12);
          color: #da6863;
          font-size: 24px;
          cursor: pointer;
        }

        .mobile-form-error {
          border-radius: 13px;
          padding: 12px 14px;
          background:
            rgba(218, 104, 99, 0.12);
          color: #a3413d;
          font-size: 13px;
          font-weight: 700;
        }

        .mobile-form-actions {
          display: grid;
          grid-template-columns:
            1fr 1.45fr;
          gap: 10px;
          margin-top: 3px;
        }

        .mobile-form-actions button {
          min-height: 50px;
          border-radius: 14px;
          padding: 0 14px;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .cancel-button {
          border: 1px solid
            rgba(36, 73, 110, 0.18);
          background: #ffffff;
          color: #24496e;
        }

        .publish-button {
          border: 0;
          background: #da6863;
          color: #ffffff;
          box-shadow:
            0 10px 22px
            rgba(218, 104, 99, 0.24);
        }

        .mobile-form-actions button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}
