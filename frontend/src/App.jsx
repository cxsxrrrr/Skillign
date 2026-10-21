import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import ErrorPanel from "./components/ErrorPanel";
import { BootScreen } from "./components/Loader";
import CatalogPage from "./pages/CatalogPage";
import CollectionPage from "./pages/CollectionPage";
import ForgotPage from "./pages/ForgotPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ResetPage from "./pages/ResetPage";
import SignupPage from "./pages/SignupPage";
import SkillPage from "./pages/SkillPage";
import VerifyPage from "./pages/VerifyPage";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const { loading, bootError, retry } = useAuth();

  if (loading) {
    return <BootScreen />;
  }

  if (bootError) {
    return (
      <ErrorPanel
        code="!"
        title="No pudimos conectar con la API"
        message={bootError}
        action={
          <button className="nb-btn nb-btn--solid" type="button" onClick={retry}>
            Reintentar
          </button>
        }
      />
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/skills/:slug" element={<SkillPage />} />
        <Route path="/mi-coleccion" element={<CollectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/crear-cuenta" element={<SignupPage />} />
        <Route path="/recuperar" element={<ForgotPage />} />
        <Route path="/verificar" element={<VerifyPage />} />
        <Route path="/nueva-contrasena" element={<ResetPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
