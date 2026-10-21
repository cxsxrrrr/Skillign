import { useDocumentTitle } from "../utils";
import ErrorPanel from "../components/ErrorPanel";
import SitePage from "../components/SitePage";

export default function NotFoundPage() {
  useDocumentTitle("404");

  return (
    <SitePage>
      <ErrorPanel
        code="404"
        title="Página no encontrada"
        message="La página que buscas no existe o cambió de sitio."
      />
    </SitePage>
  );
}
