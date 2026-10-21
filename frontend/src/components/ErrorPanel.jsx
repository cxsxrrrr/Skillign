import { Link } from "react-router-dom";

export default function ErrorPanel({
  code = "404",
  title = "Página no encontrada",
  message = "La página que buscas no existe.",
  action,
}) {
  return (
    <div className="nb-error">
      <p className="nb-error__code" aria-hidden="true">
        {code}
      </p>
      <h1 className="nb-error__title">{title}</h1>
      <p className="nb-error__text">{message}</p>
      {action || (
        <Link className="nb-btn nb-btn--solid" to="/">
          Volver al catálogo
        </Link>
      )}
    </div>
  );
}
