import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({
  panelClass = "",
  showcaseClass = "",
  orbClass = "",
  showcaseTitle,
  showcaseText,
  children,
}) {
  useEffect(() => {
    document.body.classList.add("nb", "nb-auth-body");
    return () => {
      document.body.classList.remove("nb-auth-body");
    };
  }, []);

  return (
    <main className="nb-auth">
      <section className={`nb-auth__form-panel ${panelClass}`}>
        {children}
        <Link className="nb-auth__back" to="/">
          ← Volver al catálogo
        </Link>
      </section>

      <aside className={`nb-showcase ${showcaseClass}`} aria-label="Skillign">
        <div className={`nb-orb ${orbClass}`} role="presentation" />
        <div className="nb-showcase__caption">
          <h2 className="nb-showcase__title">{showcaseTitle}</h2>
          <p className="nb-showcase__text">{showcaseText}</p>
          <div className="nb-dots" aria-hidden="true">
            <span className="nb-dots__dot" aria-current="true" />
            <span className="nb-dots__dot" />
            <span className="nb-dots__dot" />
          </div>
        </div>
      </aside>
    </main>
  );
}
