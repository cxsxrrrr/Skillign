import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useDocumentTitle } from "../utils";
import { FlashGroup } from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import Field, { PasswordField } from "../components/Field";

export default function SignupPage() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const wasAuthenticated = useRef(Boolean(user));

  useDocumentTitle("Crear cuenta");

  if (user && wasAuthenticated.current) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");

    try {
      const data = await signup({ name, email, password, confirm });
      navigate("/", {
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

  return (
    <AuthLayout
      showcaseTitle="Skills listas para tu agente."
      showcaseText="Explora, guarda y reutiliza skills de frontend para IA."
    >
      <form className="nb-auth__form" onSubmit={handleSubmit} noValidate>
        <FlashGroup items={formError ? [{ type: "error", message: formError }] : []} />

        <div>
          <h1 className="nb-auth__heading">Crea tu cuenta</h1>
        </div>
        <p className="nb-auth__subheading">Tu catálogo personal, en un solo lugar.</p>

        <Field
          id="name"
          label="Nombre"
          icon="user"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre"
          autoComplete="name"
          required
          error={errors.name}
        />

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
          error={errors.email}
        />

        <PasswordField
          id="password"
          label="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña"
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
          {submitting ? "Creando…" : "Crear cuenta"}
        </button>

        <p className="nb-auth__footer">
          ¿Ya tienes cuenta? <Link className="nb-link" to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
