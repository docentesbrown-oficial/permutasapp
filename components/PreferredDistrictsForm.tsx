"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRITOS_PBA } from "@/data/distritos";

export function PreferredDistrictsForm({ initialDistricts }: { initialDistricts: string[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialDistricts);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(
    () => DISTRITOS_PBA.filter((district) => district.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  function toggle(district: string) {
    setSelected((current) =>
      current.includes(district)
        ? current.filter((item) => item !== district)
        : [...current, district]
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/perfil/distritos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ districts: selected }),
    });

    const data = await response.json();
    setMessage(response.ok ? "Preferencias guardadas." : data.error ?? "No pudimos guardar.");
    if (response.ok) router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="district-search">Distritos de preferencia</label>
        <input
          id="district-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar distrito"
        />
        <p className="help">Los resultados de estos distritos aparecerán primero. Los demás no se ocultan.</p>
      </div>

      <div className="multi-grid" style={{ marginTop: 12 }}>
        {filtered.map((district) => (
          <label className="check" key={district}>
            <input
              type="checkbox"
              checked={selected.includes(district)}
              onChange={() => toggle(district)}
            />
            {district}
          </label>
        ))}
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 12 }}>
        {loading ? "Guardando..." : "Guardar preferencias"}
      </button>
      {message ? <p className="help" style={{ marginTop: 10 }}>{message}</p> : null}
    </form>
  );
}
