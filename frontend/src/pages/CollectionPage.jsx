import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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

export default function CollectionPage() {
  const { user, savedCount, logout, setSavedCount, refresh } = useAuth();
  const [flash, setFlash] = useLocationFlash();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busySlug, setBusySlug] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const everHadUser = useRef(Boolean(user));
  const navigate = useNavigate();

  useDocumentTitle("Mi colección");

  useEffect(() => {
    if (user) everHadUser.current = true;
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    api
      .get("/saved", { signal: controller.signal })
      .then((response) => {
        setSkills(response.skills);
        setSavedCount(response.saved_count);
      })
      .catch(async (requestError) => {
        if (requestError.name === "AbortError") return;
        if (requestError.status === 401) {
          await refresh();
          navigate("/login?next=/mi-coleccion", { replace: true });
          return;
        }
        setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [user, setSavedCount, retryKey]);

  if (!user && !everHadUser.current) {
    return <Navigate to="/login?next=/mi-coleccion" replace />;
  }

  if (!user) {
    return (
      <SitePage className="nb-collection">
        <PageLoader label="Cerrando sesión" />
      </SitePage>
    );
  }

  const handleLogout = async () => {
    try {
      const data = await logout();
      navigate("/", {
        replace: true,
        state: {
          flash: { type: "info", message: data?.message || "Sesión cerrada." },
        },
      });
    } catch (requestError) {
      setFlash({ type: "error", message: requestError.message });
    }
  };

  const removeSkill = async (skill) => {
    setBusySlug(skill.slug);
    try {
      const response = await api.post(`/skills/${skill.slug}/save`);
      setSkills((current) => current.filter((item) => item.slug !== skill.slug));
      setSavedCount(response.saved_count);
      setFlash({ type: "info", message: response.message });
    } catch (requestError) {
      if (requestError.status === 401) {
        await refresh();
        navigate("/login?next=/mi-coleccion");
      } else {
        setFlash({ type: "error", message: requestError.message });
      }
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <SitePage className="nb-collection">
      <FlashGroup items={flash ? [flash] : []} />
      <h1 className="nb-title-badge">Mi colección</h1>

      <div className="nb-collection__bar">
        <p className="nb-collection__count">
          <strong>{skills.length}</strong>{" "}
          {skills.length === 1 ? "skill guardada" : "skills guardadas"}
          <span> para {user.name.split(" ")[0]}</span>
        </p>
        <button className="nb-btn nb-btn--outline" type="button" onClick={handleLogout}>
          <Icon name="log-out" /> Cerrar sesión
        </button>
      </div>

      {loading && <PageLoader label="Cargando tu colección" />}

      {!loading && error && (
        <ErrorPanel
          code="!"
          title="No pudimos cargar tu colección"
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
      )}

      {!loading && !error && skills.length > 0 && (
        <div className="nb-grid nb-grid--collection">
          {skills.map((skill) => (
            <div className="nb-saved-item" key={skill.slug}>
              <SkillCard skill={skill} grid heading="h2" />
              <button
                className="nb-btn nb-btn--outline nb-btn--block nb-saved-item__remove"
                type="button"
                onClick={() => removeSkill(skill)}
                disabled={busySlug === skill.slug}
              >
                <Icon name="x" /> {busySlug === skill.slug ? "Quitando…" : "Quitar"}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && skills.length === 0 && (
        <div className="nb-empty">
          <span className="nb-empty__icon">
            <Icon name="bookmark" className="nb-icon nb-icon--xl" />
          </span>
          <h2 className="nb-empty__title">Tu colección está vacía</h2>
          <p className="nb-empty__text">
            Guarda las skills que quieras aprender y vuelve a ellas cuando lo necesites.
          </p>
          <Link className="nb-btn nb-btn--solid" to="/">
            Explorar skills
          </Link>
        </div>
      )}

      <p className="nb-sr-only" aria-live="polite">
        {savedCount} skills en tu colección.
      </p>
    </SitePage>
  );
}
