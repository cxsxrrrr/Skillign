import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useDocumentTitle } from "../utils";
import { FlashGroup } from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";

export default function ForgotPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [repeat, setRepeat] = useState(initialEmail);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle("Recuperar contraseña");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");

    try {
      const data = await api.post("/auth/forgot", { email, repeat });
      navigate(`/verificar?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      setErrors(error.data?.errors || {});
      setFormError(error.data?.errors ? "" : error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      showcaseTitle="¿Olvidaste tu contraseña?"
      showcaseText="Puedes recuperarla fácilmente."
    >
      <form className="nb-auth__form" onSubmit={handleSubmit} noValidate>
        <FlashGroup items={formError ? [{ type: "error", message: formError }] : []} />

        <div>
          <h1 className="nb-auth__heading">¿Olvidaste tu contraseña?</h1>
        </div>
        <p className="nb-auth__subheading">Te enviaremos un código de verificación.</p>

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
          faint
          error={errors.email}
        />

        <Field
          id="repeat"
          label="Repite tu email"
          type="email"
          icon="mail"
          value={repeat}
          onChange={(event) => setRepeat(event.target.value)}
          placeholder="Repite el email"
          autoComplete="off"
          required
          faint
          error={errors.repeat}
        />

        <button
          className="nb-btn nb-btn--solid nb-btn--block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Enviando…" : "Enviar código"}
        </button>

        <p className="nb-auth__footer">
          ¿La recordaste? <Link className="nb-link" to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
