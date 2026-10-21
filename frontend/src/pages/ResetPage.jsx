import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useDocumentTitle } from "../utils";
import { FlashGroup } from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import { PasswordField } from "../components/Field";
import { PageLoader } from "../components/Loader";

export default function ResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle("Nueva contraseña");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");

    api
      .get("/auth/reset", { signal: controller.signal })
      .then((data) => setEmail(data.email))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");

    try {
      const data = await api.post("/auth/reset", { password, confirm });
      navigate("/login", {
        replace: true,
        state: { flash: { type: "success", message: data.message } },
      });
    } catch (error) {
      setErrors(error.data?.errors || {});
      setFormError(error.data?.errors ? "" : error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout
        showcaseTitle="Una nueva llave."
        showcaseText="Elige una contraseña segura y vuelve a lo tuyo."
      >
        <PageLoader label="Comprobando enlace" />
      </AuthLayout>
    );
  }

  if (loadError) {
    return (
      <AuthLayout
        showcaseTitle="Una nueva llave."
        showcaseText="Elige una contraseña segura y vuelve a lo tuyo."
      >
        <div className="nb-auth__form">
          <FlashGroup items={[{ type: "error", message: loadError }]} />
          <h1 className="nb-auth__heading">Enlace no disponible</h1>
          <p className="nb-auth__subheading">
            Solicita un código nuevo para restablecer tu contraseña.
          </p>
          <Link className="nb-btn nb-btn--solid nb-btn--block" to="/recuperar">
            Solicitar código
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      showcaseTitle="Una nueva llave."
      showcaseText="Elige una contraseña segura y vuelve a lo tuyo."
    >
      <form className="nb-auth__form" onSubmit={handleSubmit} noValidate>
        <FlashGroup
          items={formError ? [{ type: "error", message: formError }] : []}
        />

        <div>
          <h1 className="nb-auth__heading">Nueva contraseña</h1>
        </div>
        <p className="nb-auth__subheading">
          Elige una contraseña de al menos 8 caracteres para {email}.
        </p>

        <PasswordField
          id="password"
          label="Nueva contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Nueva contraseña"
          autoComplete="new-password"
          minLength={8}
          required
          error={errors.password}
        />

        <PasswordField
          id="confirm"
          label="Repite la contraseña"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          minLength={8}
          required
          error={errors.confirm}
        />

        <button
          className="nb-btn nb-btn--solid nb-btn--block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Guardando…" : "Guardar contraseña"}
        </button>

        <p className="nb-auth__footer">
          ¿Ya la cambiaste? <Link className="nb-link" to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
