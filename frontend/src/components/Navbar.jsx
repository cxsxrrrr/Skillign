import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { firstName } from "../utils";
import Icon from "./Icon";

export default function Navbar() {
  const { user, savedCount, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const closeMenu = (event) => {
      if (menuRef.current?.open && !menuRef.current.contains(event.target)) {
        menuRef.current.open = false;
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  const focusSearch = () => {
    const input = document.querySelector("[data-search-input]");
    if (location.pathname === "/" && input) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      input.focus();
      input.scrollIntoView({
        block: "center",
        behavior: reduceMotion ? "auto" : "smooth",
      });
      return;
    }
    navigate("/?focus=search");
  };

  const handleLogout = async () => {
    closeMenu();
    try {
      const data = await logout();
      navigate("/", {
        replace: true,
        state: { flash: { type: "info", message: data?.message || "Sesión cerrada." } },
      });
    } catch {
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="nb-navbar">
      <Link className="nb-navbar__brand" to="/">
        Skillign<span className="nb-navbar__dot" aria-hidden="true">.</span>
      </Link>

      <nav className="nb-navbar__nav" aria-label="Principal">
        <ul className="nb-navbar__links">
          <li>
            <NavLink className="nb-navbar__link" to="/" end>
              Explorar skills
            </NavLink>
          </li>
          <li>
            <NavLink className="nb-navbar__link" to="/mi-coleccion">
              Mi colección
              {savedCount > 0 && <span className="nb-navbar__count">{savedCount}</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="nb-navbar__tools">
        <button
          type="button"
          className="nb-navbar__search"
          aria-label="Buscar skills"
          onClick={focusSearch}
        >
          <Icon name="search" className="nb-icon nb-icon--lg" />
        </button>

        {user ? (
          <Link
            className="nb-navbar__user"
            to="/mi-coleccion"
            aria-label={`Mi colección, ${user.name}`}
          >
            <span className="nb-navbar__username">{firstName(user.name)}</span>
            <span className="nb-avatar">
              <Icon name="user" />
            </span>
          </Link>
        ) : (
          <Link className="nb-navbar__user nb-navbar__user--guest" to="/login">
            <span className="nb-navbar__username">Iniciar sesión</span>
            <span className="nb-avatar">
              <Icon name="user" />
            </span>
          </Link>
        )}

        <details className="nb-navbar__menu" ref={menuRef}>
          <summary className="nb-navbar__menu-btn" aria-label="Abrir menú de navegación">
            <Icon name="menu" className="nb-icon nb-icon--lg" />
          </summary>
          <div className="nb-navbar__menu-panel">
            <Link className="nb-navbar__menu-link" to="/" onClick={closeMenu}>
              Explorar skills
            </Link>
            <Link className="nb-navbar__menu-link" to="/mi-coleccion" onClick={closeMenu}>
              Mi colección{savedCount > 0 ? ` (${savedCount})` : ""}
            </Link>
            {user ? (
              <button
                className="nb-btn nb-btn--outline nb-btn--block"
                type="button"
                onClick={handleLogout}
              >
                <Icon name="log-out" /> Cerrar sesión
              </button>
            ) : (
              <Link
                className="nb-btn nb-btn--solid nb-btn--block"
                to="/login"
                onClick={closeMenu}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
