import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {
  const location = useLocation();
  const hideNavRoutes = ["/", "/welcome", "/register"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        background: "#FFFFFF",
      }}
    >
      {/* CONTENEDOR RESPONSIVE */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px", // más amplio en escritorio
          padding: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "600px", // más ancho que los 450px móviles
          }}
        >
          <Outlet />
        </div>
      </div>

      {/* Bottom Nav solo en móvil */}
      {!shouldHideNav && (
        <div style={{ width: "100%", maxWidth: "1100px" }}>
          <BottomNav />
        </div>
      )}
    </div>
  );
}
