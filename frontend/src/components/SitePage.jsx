import { useEffect } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function SitePage({ children, className = "" }) {
  useEffect(() => {
    document.body.classList.remove("nb-auth-body");
    document.body.classList.add("nb");
  }, []);

  return (
    <>
      <a className="nb-skip" href="#contenido">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className={`nb-page ${className}`}>
        {children}
        <Footer />
      </main>
    </>
  );
}
