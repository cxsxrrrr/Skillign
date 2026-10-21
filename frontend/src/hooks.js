import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useLocationFlash() {
  const location = useLocation();
  const navigate = useNavigate();
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (location.state?.flash) {
      setFlash(location.state.flash);
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: {},
      });
    }
  }, [location, navigate]);

  return [flash, setFlash];
}
