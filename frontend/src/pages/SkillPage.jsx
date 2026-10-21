import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useLocationFlash } from "../hooks";
import { useDocumentTitle } from "../utils";
import { FlashGroup } from "../components/Alert";
import ErrorPanel from "../components/ErrorPanel";
import Icon from "../components/Icon";
import { PageLoader } from "../components/Loader";
import SitePage from "../components/SitePage";
import SkillCard from "../components/SkillCard";
import SkillCover from "../components/SkillCover";

export default function SkillPage() {
  const { slug } = useParams();
  const { user, setSavedCount, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [flash, setFlash] = useLocationFlash();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useDocumentTitle(data?.skill?.name || "Skill");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    api
      .get(`/skills/${slug}`, { signal: controller.signal })
      .then((response) => setData(response))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
          setErrorStatus(requestError.status);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug, user?.id, retryKey]);

  const handleSave = async () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }

    setSaving(true);
    try {
      const response = await api.post(`/skills/${slug}/save`);
      setData((current) => (current ? { ...current, saved: response.saved } : current));
      setSavedCount(response.saved_count);
      setFlash({
        type: response.saved ? "success" : "info",
        message: response.message,
      });
    } catch (requestError) {
      if (requestError.status === 401) {
        await refresh();
        navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      } else {
        setFlash({ type: "error", message: requestError.message });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SitePage className="nb-detail-page">
        <PageLoader label="Cargando skill" />
      </SitePage>
    );
  }

  if (error) {
    return (
      <SitePage className="nb-detail-page">
        <ErrorPanel
          code={errorStatus === 404 ? "404" : "!"}
          title={errorStatus === 404 ? "Skill no encontrada" : "No pudimos cargar la skill"}
          message={error}
          action={
            errorStatus === 404 ? (
              <Link className="nb-btn nb-btn--solid" to="/">
                Volver al catálogo
              </Link>
            ) : (
              <button
                className="nb-btn nb-btn--solid"
                type="button"
                onClick={() => setRetryKey((current) => current + 1)}
              >
                Reintentar
              </button>
            )
          }
        />
      </SitePage>
    );
  }

  const { skill, category, saved, related } = data;

  return (
    <SitePage className="nb-detail-page">
      <Link className="nb-back" to={`/?category=${category.slug}`}>
        <Icon name="arrow-left" /> Volver a {category.label}
      </Link>

      <FlashGroup items={flash ? [flash] : []} />

      <article className="nb-detail">
        <aside className="nb-detail__media">
          <div className="nb-detail__cover-wrap">
            <SkillCover skill={skill} className="nb-detail__cover" />
          </div>

          {user ? (
            <button
              className={`nb-btn ${saved ? "nb-btn--outline" : "nb-btn--solid"} nb-btn--block`}
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                "Guardando…"
              ) : saved ? (
                <>
                  <Icon name="x" /> Quitar de mi colección
                </>
              ) : (
                <>
                  <Icon name="bookmark" /> Guardar skill
                </>
              )}
            </button>
          ) : (
            <Link
              className="nb-btn nb-btn--solid nb-btn--block"
              to={`/login?next=${encodeURIComponent(location.pathname)}`}
            >
              <Icon name="bookmark" /> Guardar skill
            </Link>
          )}
          {!user && (
            <p className="nb-detail__hint">
              Inicia sesión para guardarla en tu colección.
            </p>
          )}
        </aside>

        <div className="nb-detail__body">
          <div className="nb-detail__eyebrow">
            <Link className="nb-tag nb-tag--inverse" to={`/?category=${category.slug}`}>
              {category.label}
            </Link>
            <span className="nb-detail__number">Skill {skill.cover.number}</span>
          </div>

          <h1 className="nb-detail__title">{skill.name}</h1>
          <p className="nb-detail__lead">{skill.summary}</p>

          <section className="nb-detail__section">
            <h2 className="nb-detail__section-title">Capacidades</h2>
            <ul className="nb-topics">
              {skill.topics.map((topic) => (
                <li className="nb-topics__item" key={topic}>
                  <Icon name="check" /> <span>{topic}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="nb-detail__section">
            <h2 className="nb-detail__section-title">Recursos</h2>
            <ul className="nb-resources">
              {skill.resources.map((resource) => (
                <li key={resource.url}>
                  <a
                    className="nb-resource"
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="nb-resource__icon">
                      <Icon name="book-open" />
                    </span>
                    <span className="nb-resource__label">{resource.label}</span>
                    <Icon name="external" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      {related.length > 0 && (
        <section className="nb-section nb-related" aria-labelledby="related-title">
          <div className="nb-section__head">
            <div className="nb-section__heading">
              <h2 className="nb-section__title" id="related-title">
                Sigue con estas skills
              </h2>
              <span className="nb-section__kicker">Misma categoría</span>
            </div>
            <span className="nb-section__meta">
              {related.length} {related.length === 1 ? "skill" : "skills"}
            </span>
          </div>
          <div className="nb-grid">
            {related.map((item) => (
              <SkillCard key={item.slug} skill={item} grid />
            ))}
          </div>
        </section>
      )}
    </SitePage>
  );
}
