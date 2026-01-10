import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {
  const location = useLocation();

  const hideNavRoutes = ["/", "/welcome", "/register"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  const isDesktop = window.matchMedia("(min-width: 900px)").matches;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        background: "#FFFFFF",
      }}
    >
      {/* SIDEBAR SOLO EN ESCRITORIO */}
      {isDesktop && (
        <aside
          style={{
            width: "260px",
            padding: "25px 20px",
            background: "#F4F6FF",
            borderRight: "1px solid #E3E6F5",
          }}
        >
          <h2 style={{ marginBottom: 20 }}>GlucoBot Panel</h2>

          <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.2" }}>
            <li>💊 Medicamentos</li>
            <li>🩸 Glicemia</li>
            <li>🍽 Alimentación</li>
            <li>📅 Citas</li>
            <li>🤖 GlucoBot</li>
            <li>👤 Mi Perfil</li>
          </ul>
        </aside>
      )}

      {/* CONTENIDO CENTRAL */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          paddingBottom: shouldHideNav ? "0" : "80px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            padding: "20px",
          }}
        >
          <Outlet />
        </div>
      </main>

      {/* NAV INFERIOR SOLO EN MÓVIL */}
      {!shouldHideNav && !isDesktop && (
        <div style={{ width: "100%" }}>
          <BottomNav />
        </div>
      )}
    </div>
  );
}
