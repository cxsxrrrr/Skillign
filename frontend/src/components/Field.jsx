import { useState } from "react";
import Icon from "./Icon";

export default function Field({
  id,
  label,
  type = "text",
  icon,
  value,
  onChange,
  error,
  faint = false,
  tint = false,
  action,
  inputClassName = "",
  ...inputProps
}) {
  const classes = [
    "nb-field",
    tint ? "nb-field--tint" : "",
    faint ? "nb-field--faint-icon" : "",
    error ? "nb-field--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="nb-field-group">
      <label className={classes} htmlFor={id}>
        <span className="nb-sr-only">{label}</span>
        {icon && <Icon name={icon} className="nb-icon nb-field__icon" />}
        <input
          id={id}
          name={id}
          className={`nb-field__input ${inputClassName}`.trim()}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={inputProps.placeholder || label}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        {action}
      </label>
      {error && (
        <p className="nb-field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  tint = false,
  autoComplete = "current-password",
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      icon="lock"
      value={value}
      onChange={onChange}
      error={error}
      tint={tint}
      autoComplete={autoComplete}
      action={
        <button
          type="button"
          className="nb-field__action"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <Icon name={visible ? "eye" : "eye-off"} />
        </button>
      }
      {...inputProps}
    />
  );
}
