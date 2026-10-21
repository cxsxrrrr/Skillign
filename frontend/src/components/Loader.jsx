export function PageLoader({ label = "Cargando…" }) {
  return (
    <div className="nb-loading" role="status" aria-live="polite">
      <span>{label}</span>
      <span className="nb-loading__bars" aria-hidden="true">
        <span className="nb-loading__bar" />
        <span className="nb-loading__bar" />
        <span className="nb-loading__bar" />
      </span>
    </div>
  );
}

export function BootScreen() {
  return (
    <div className="nb-boot">
      <span className="nb-boot__mark" aria-hidden="true">
        S
      </span>
      <PageLoader label="Cargando Skillign" />
    </div>
  );
}
