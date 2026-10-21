import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth";
import { useLocationFlash } from "../hooks";
import { safeInternalPath, useDocumentTitle } from "../utils";
import { FlashGroup } from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import Field, { PasswordField } from "../components/Field";

function GoogleMark() {
  return (
    <svg className="nb-provider-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg className="nb-provider-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="9.5" height="9.5" fill="#f25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7fba00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00a4ef" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#ffb900" />
    </svg>
  );
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flash] = useLocationFlash();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [providerNote, setProviderNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const wasAuthenticated = useRef(Boolean(user));
  const nextPath = safeInternalPath(searchParams.get("next"), "/");

  useDocumentTitle("Iniciar sesión");

  if (user && wasAuthenticated.current) {
    return <Navigate to={nextPath} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");
    setProviderNote("");

    try {
      const data = await login({ email, password, remember });
      navigate(nextPath, {
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

  const messages = [
    flash,
    providerNote ? { type: "info", message: providerNote } : null,
    formError ? { type: "error", message: formError } : null,
  ].filter(Boolean);

  return (
    <AuthLayout
      panelClass="nb-auth__form-panel--tint"
      showcaseClass="nb-showcase--dark"
      orbClass="nb-orb--dark"
      showcaseTitle="Conecta con cualquier dispositivo."
      showcaseText="Todo lo que necesitas es una conexión a internet."
    >
      <form className="nb-auth__form" onSubmit={handleSubmit} noValidate>
        <FlashGroup items={messages} />

        <div>
          <h1 className="nb-auth__heading">Inicia sesión en tu cuenta</h1>
        </div>
        <p className="nb-auth__subheading">Bienvenido de nuevo. Elige cómo entrar:</p>

        <div className="nb-auth__providers">
          <button
            type="button"
            className="nb-btn nb-btn--outline"
            onClick={() =>
              setProviderNote(
                "El acceso con Google aún no está configurado. Usa tu email mientras tanto."
              )
            }
          >
            <GoogleMark /> Google
          </button>
          <button
            type="button"
            className="nb-btn nb-btn--outline"
            onClick={() =>
              setProviderNote(
                "El acceso con Microsoft aún no está configurado. Usa tu email mientras tanto."
              )
            }
          >
            <MicrosoftMark /> Microsoft
          </button>
        </div>

        <div className="nb-divider">o continúa con email</div>

        <Field
          id="email"
          label="Email"
          type="email"
          icon="mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
          tint
          error={errors.email}
        />

        <PasswordField
          id="password"
          label="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña"
          autoComplete="current-password"
          required
          tint
          error={errors.password}
        />

        <div className="nb-auth__row">
          <label className="nb-check">
            <input
              className="nb-check__box"
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Recordarme
          </label>
          <Link className="nb-link" to="/recuperar">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          className="nb-btn nb-btn--solid nb-btn--block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>

        <p className="nb-auth__footer">
          ¿No tienes cuenta? <Link className="nb-link" to="/crear-cuenta">Crear una cuenta</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
