import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useLocationFlash } from "../hooks";
import { formatCount, useDocumentTitle } from "../utils";
import { FlashGroup } from "../components/Alert";
import ErrorPanel from "../components/ErrorPanel";
import Icon from "../components/Icon";
import { PageLoader } from "../components/Loader";
import SitePage from "../components/SitePage";
import SkillCard from "../components/SkillCard";

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const [flash] = useLocationFlash();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const searchRef = useRef(null);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const focusSearchParam = searchParams.get("focus") === "search";
  const pageTitle = q ? "Buscar" : category ? data?.category?.label || "Categoría" : "Explorar";

  useDocumentTitle(q ? `Buscar: ${q}` : pageTitle);

  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const suffix = params.toString() ? `?${params.toString()}` : "";

    api
      .get(`/catalog${suffix}`, { signal: controller.signal })
      .then((response) => setData(response))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [q, category, retryKey, user?.id]);

  useEffect(() => {
    if (loading) return;
    if (!focusSearchParam && location.hash !== "#buscar") return;

    const timer = window.setTimeout(() => {
      const input = searchRef.current;
      if (input) {
        input.focus();
        input.scrollIntoView({ block: "center" });
      }
      if (focusSearchParam) {
        const next = new URLSearchParams(searchParams);
        next.delete("focus");
        setSearchParams(next, { replace: true });
      }
    }, 50);

    return () => window.clearTimeout(timer);
  }, [loading, focusSearchParam, location.hash, searchParams, setSearchParams]);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    const next = new URLSearchParams();
    if (term) next.set("q", term);
    setSearchParams(next);
  };

  if (error) {
    return (
      <SitePage className="nb-catalog">
        <ErrorPanel
          code="!"
          title="No pudimos cargar el catálogo"
          message={error}
          action={
            <button
              className="nb-btn nb-btn--solid"
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
            >
              Reintentar
            </button>
          }
        />
      </SitePage>
    );
  }

  return (
    <SitePage className="nb-catalog">
      <FlashGroup items={flash ? [flash] : []} />
      <h1 className="nb-title-badge">{pageTitle}</h1>

      {category && !q && data?.category?.description && (
        <p className="nb-catalog__intro">{data.category.description}</p>
      )}

      <form
        className="nb-search-row"
        id="buscar"
        method="get"
        action="/"
        role="search"
        onSubmit={submitSearch}
      >
        <label className="nb-field nb-search-row__field" htmlFor="catalog-search">
          <span className="nb-sr-only">Buscar skills</span>
          <Icon name="search" className="nb-icon nb-field__icon" />
          <input
            id="catalog-search"
            ref={searchRef}
            className="nb-field__input"
            type="search"
            name="q"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Busca por skill, tema o categoría…"
            autoComplete="off"
            data-search-input
          />
        </label>
        <button className="nb-btn nb-btn--solid" type="submit">
          Buscar
        </button>
      </form>

      <nav className="nb-chips" aria-label="Filtrar por categoría">
        <Link
          className={`nb-chip${!category && !q ? " is-active" : ""}`}
          to="/"
          aria-current={!category && !q ? "page" : undefined}
        >
          Todas las skills
        </Link>
        {data?.categories?.map((item) => (
          <Link
            key={item.slug}
            className={`nb-chip${category === item.slug ? " is-active" : ""}`}
            to={`/?category=${item.slug}`}
            aria-current={category === item.slug ? "page" : undefined}
          >
            {item.label} <span>{data.counts?.[item.slug] ?? 0}</span>
          </Link>
        ))}
      </nav>

      {loading && <PageLoader label="Cargando catálogo" />}

      {!loading && q && (
        <section className="nb-results" aria-labelledby="results-title">
          <div className="nb-results__head">
            <div>
              <h2 className="nb-results__title" id="results-title">
                {formatCount(data?.results?.length || 0, "resultado", "resultados")} para “{q}”
              </h2>
              <p className="nb-results__meta">Búsqueda en nombres, temas y categorías.</p>
            </div>
            <Link className="nb-link" to="/">
              Limpiar búsqueda
            </Link>
          </div>

          {data?.results?.length ? (
            <div className="nb-grid">
              {data.results.map((skill) => (
                <SkillCard key={skill.slug} skill={skill} grid />
              ))}
            </div>
          ) : (
            <div className="nb-empty">
              <span className="nb-empty__icon">
                <Icon name="search" className="nb-icon nb-icon--xl" />
              </span>
              <h2 className="nb-empty__title">Nada por aquí todavía</h2>
              <p className="nb-empty__text">
                No encontramos skills con “{q}”. Prueba con “flexbox”, “react” o
                “accesibilidad”.
              </p>
              <Link className="nb-btn nb-btn--outline" to="/">
                Ver todas las skills
              </Link>
            </div>
          )}
        </section>
      )}

      {!loading && !q && data && (
        <>
          {data.recommended && (
            <section
              className="nb-section nb-section--recommended"
              aria-labelledby="recommended-title"
            >
              <div className="nb-section__head">
                <div className="nb-section__heading">
                  <span className="nb-tag nb-tag--inverse">Para ti</span>
                  <h2 className="nb-section__title" id="recommended-title">
                    {data.recommended.title}
                  </h2>
                </div>
                <span className="nb-section__meta">
                  {formatCount(data.recommended.skills.length, "skill", "skills")}
                </span>
              </div>
              <div className="nb-shelf">
                {data.recommended.skills.map((skill) => (
                  <SkillCard key={skill.slug} skill={skill} />
                ))}
              </div>
            </section>
          )}

          {data.shelves.map((shelf) => (
            <section
              key={shelf.category.slug}
              className="nb-section"
              id={`cat-${shelf.category.slug}`}
              aria-labelledby={`title-${shelf.category.slug}`}
            >
              <div className="nb-section__head">
                <div className="nb-section__heading">
                  <h2
                    className="nb-section__title"
                    id={`title-${shelf.category.slug}`}
                  >
                    {shelf.category.label}
                  </h2>
                  <span className="nb-section__kicker">{shelf.category.kicker}</span>
                </div>
                <div className="nb-section__aside">
                  <span className="nb-section__meta">
                    {formatCount(shelf.skills.length, "skill", "skills")}
                  </span>
                  {!category && (
                    <Link
                      className="nb-section__link"
                      to={`/?category=${shelf.category.slug}`}
                    >
                      Ver categoría <Icon name="arrow-right" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="nb-shelf">
                {shelf.skills.map((skill) => (
                  <SkillCard key={skill.slug} skill={skill} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </SitePage>
  );
}
