import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useDocumentTitle } from "../utils";
import { FlashGroup } from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import { PageLoader } from "../components/Loader";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const navigate = useNavigate();
  const [email, setEmail] = useState(emailParam);
  const [demoCode, setDemoCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle("Verificar código");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    const suffix = emailParam ? `?email=${encodeURIComponent(emailParam)}` : "";

    api
      .get(`/auth/verify${suffix}`, { signal: controller.signal })
      .then((data) => {
        setEmail(data.email);
        setDemoCode(data.demo_code || null);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [emailParam]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");

    try {
      await api.post("/auth/verify", { email, code });
      navigate("/nueva-contrasena", { replace: true });
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
        showcaseClass="nb-showcase--dark"
        orbClass="nb-orb--dark"
        showcaseTitle="Casi dentro."
        showcaseText="Un código de 6 dígitos y vuelves a tu catálogo."
      >
        <PageLoader label="Preparando verificación" />
      </AuthLayout>
    );
  }

  if (loadError) {
    return (
      <AuthLayout
        showcaseClass="nb-showcase--dark"
        orbClass="nb-orb--dark"
        showcaseTitle="Casi dentro."
        showcaseText="Un código de 6 dígitos y vuelves a tu catálogo."
      >
        <div className="nb-auth__form">
          <FlashGroup items={[{ type: "error", message: loadError }]} />
          <h1 className="nb-auth__heading">Solicita un código</h1>
          <p className="nb-auth__subheading">
            Necesitamos un email para continuar con la recuperación.
          </p>
          <Link className="nb-btn nb-btn--solid nb-btn--block" to="/recuperar">
            Ir a recuperar contraseña
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      showcaseClass="nb-showcase--dark"
      orbClass="nb-orb--dark"
      showcaseTitle="Casi dentro."
      showcaseText="Un código de 6 dígitos y vuelves a tu catálogo."
    >
      <form className="nb-auth__form" onSubmit={handleSubmit} noValidate>
        <FlashGroup
          items={formError ? [{ type: "error", message: formError }] : []}
        />

        <div>
          <h1 className="nb-auth__heading">Revisa tu email</h1>
        </div>
        <p className="nb-auth__subheading">
          Enviamos un código de 6 dígitos a <strong>{email}</strong>.
        </p>

        <Field
          id="code"
          label="Código de verificación"
          icon="shield"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="000000"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoComplete="one-time-code"
          required
          inputClassName="nb-otp__input"
          error={errors.code}
        />

        {demoCode && (
          <div className="nb-demo">
            <span>Código de demostración</span>
            <strong>{demoCode}</strong>
          </div>
        )}

        <button
          className="nb-btn nb-btn--solid nb-btn--block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Verificando…" : "Verificar código"}
        </button>

        <p className="nb-auth__footer">
          ¿No llegó?{" "}
          <Link
            className="nb-link"
            to={`/recuperar?email=${encodeURIComponent(email)}`}
          >
            Solicitar otro código
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
