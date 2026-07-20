"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRITOS_PBA } from "@/data/distritos";
import type { Puesto, ScheduleItem } from "@/lib/types";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const EMPTY_SCHEDULE: ScheduleItem = { day: "Lunes", from: "08:00", to: "10:00" };

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
  schedule: [{ ...EMPTY_SCHEDULE }],
};

export function PuestoManager({ initialPuestos }: { initialPuestos: Puesto[] }) {
  const router = useRouter();
  const [puestos, setPuestos] = useState(initialPuestos);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateSchedule(index: number, key: keyof ScheduleItem, value: string) {
    setForm((current) => ({
      ...current,
      schedule: current.schedule.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function addSchedule() {
    setForm((current) => ({ ...current, schedule: [...current.schedule, { ...EMPTY_SCHEDULE }] }));
  }

  function removeSchedule(index: number) {
    setForm((current) => ({
      ...current,
      schedule: current.schedule.length === 1
        ? current.schedule
        : current.schedule.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function startEdit(puesto: Puesto) {
    setEditingId(puesto.id);
    setForm({
      description: puesto.description,
      pid: puesto.pid,
      school: puesto.school,
      district: puesto.district,
      schedule: puesto.schedule.length ? puesto.schedule : [{ ...EMPTY_SCHEDULE }],
    });
    setMessage("Editando puesto.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch(editingId ? `/api/puestos/${editingId}` : "/api/puestos", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "No pudimos guardar el puesto.");
      setLoading(false);
      return;
    }

    if (editingId) {
      setPuestos((current) => current.map((item) => item.id === editingId ? data.puesto : item));
    } else {
      setPuestos((current) => [data.puesto, ...current]);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setMessage(editingId ? "Puesto modificado." : "Puesto publicado.");
    router.refresh();
    setLoading(false);
  }

  async function deletePuesto(id: string) {
    if (!window.confirm("¿Eliminar este puesto? Esta acción no se puede deshacer.")) return;

    const response = await fetch(`/api/puestos/${id}`, { method: "DELETE" });
    if (response.ok) {
      setPuestos((current) => current.filter((item) => item.id !== id));
      if (editingId === id) cancelEdit();
      router.refresh();
    } else {
      const data = await response.json();
      setMessage(data.error ?? "No pudimos eliminar el puesto.");
    }
  }

  return (
    <>
      <section className="card">
        <h2>{editingId ? "Modificar puesto" : "Agregar un puesto"}</h2>
        <p className="help">Podés cargar todos los cargos, módulos u horas cátedra titulares que quieras ofrecer.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="description">Cargo, módulos u horas cátedra</label>
              <input
                id="description"
                required
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Ej.: 4 módulos titulares de Física"
              />
            </div>

            <div className="field">
              <label htmlFor="pid">Código PID</label>
              <input
                id="pid"
                required
                value={form.pid}
                onChange={(event) => setForm({ ...form, pid: event.target.value })}
                placeholder="Ej.: 123456"
              />
            </div>

            <div className="field">
              <label htmlFor="school">Escuela</label>
              <input
                id="school"
                required
                value={form.school}
                onChange={(event) => setForm({ ...form, school: event.target.value })}
                placeholder="Ej.: EES N.º 18"
              />
            </div>

            <div className="field full">
              <label htmlFor="district">Distrito</label>
              <select
                id="district"
                value={form.district}
                onChange={(event) => setForm({ ...form, district: event.target.value })}
              >
                {DISTRITOS_PBA.map((district) => <option key={district}>{district}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label>Días y horarios</label>
            {form.schedule.map((item, index) => (
              <div className="form-grid" key={`${index}-${item.day}`} style={{ marginTop: 10 }}>
                <div className="field">
                  <select value={item.day} onChange={(event) => updateSchedule(index, "day", event.target.value)}>
                    {DAYS.map((day) => <option key={day}>{day}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                  <input aria-label="Desde" type="time" value={item.from} onChange={(event) => updateSchedule(index, "from", event.target.value)} />
                  <input aria-label="Hasta" type="time" value={item.to} onChange={(event) => updateSchedule(index, "to", event.target.value)} />
                  <button className="btn btn-danger" type="button" onClick={() => removeSchedule(index)} aria-label="Quitar día">×</button>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" type="button" onClick={addSchedule} style={{ marginTop: 10 }}>+ Agregar otro día</button>
          </div>

          {message ? <div className={message.includes("No pudimos") ? "error" : "success"}>{message}</div> : null}

          <div className="hero-actions">
            <button className="btn btn-accent" type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Publicar puesto"}
            </button>
            {editingId ? <button className="btn btn-ghost" type="button" onClick={cancelEdit}>Cancelar</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="job-item-top">
          <div>
            <h2>Mis puestos</h2>
            <p className="help">{puestos.length} puesto{puestos.length === 1 ? "" : "s"} cargado{puestos.length === 1 ? "" : "s"}.</p>
          </div>
        </div>

        <div className="job-list" style={{ marginTop: 18 }}>
          {puestos.length === 0 ? (
            <div className="empty">Todavía no cargaste ningún puesto para permutar.</div>
          ) : puestos.map((puesto) => (
            <article className="job-item" key={puesto.id}>
              <div className="job-item-top">
                <div>
                  <h3 className="job-title">{puesto.description}</h3>
                  <p className="job-sub">PID {puesto.pid} · {puesto.school} · {puesto.district}</p>
                </div>
                <span className="badge badge-status">Publicado</span>
              </div>
              <div className="schedule-list">
                <div>
                  {puesto.schedule.map((item, index) => (
                    <span className="schedule-chip" key={`${item.day}-${index}`}>
                      {item.day}: {item.from}–{item.to}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hero-actions">
                <button className="btn btn-ghost" type="button" onClick={() => startEdit(puesto)}>Modificar</button>
                <button className="btn btn-danger" type="button" onClick={() => deletePuesto(puesto.id)}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
