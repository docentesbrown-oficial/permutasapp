"use client";

type CopyMatchSummaryButtonProps = {
  summary: string;
};

export function CopyMatchSummaryButton({
  summary,
}: CopyMatchSummaryButtonProps) {
  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);

      window.alert(
        "Resumen copiado. Ya podés pegarlo en WhatsApp, correo o donde necesites."
      );
    } catch {
      window.alert(
        "No se pudo copiar automáticamente. Probá nuevamente."
      );
    }
  }

  return (
    <button
      className="btn btn-accent"
      type="button"
      onClick={copySummary}
    >
      Copiar resumen
    </button>
  );
}
