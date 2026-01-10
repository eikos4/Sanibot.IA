import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {
  const location = useLocation();

  const [isDesktop, setIsDesktop] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const detectar = () => setIsDesktop(window.innerWidth >= 800);
    detectar();
    window.addEventListener("resize", detectar);
    return () => window.removeEventListener("resize", detectar);
  }, []);

  // Rutas sin navegación inferior
  const hideNavRoutes = ["/", "/welcome", "/register"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* CONTENEDOR RESPONSIVE */}
      <div
        style={{
          width: "100%",
          maxWidth: isDesktop ? "1000px" : "450px",
          padding: "20px",
          flexGrow: 1,
        }}
      >
        <Outlet />
      </div>

      {/* NAV SOLO EN MÓVIL */}
      {!isDesktop && !shouldHideNav && (
        <div
          style={{
            width: "100%",
            maxWidth: "450px",
          }}
        >
          <BottomNav />
        </div>
      )}
    </div>
  );
}
