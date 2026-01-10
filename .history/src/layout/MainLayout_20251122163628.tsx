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
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: "100dvh",
        width: "100%",
        backgroundColor: "#FFFFFF",
        overflowX: "hidden",
        paddingBottom: shouldHideNav ? "0px" : "80px",
      }}
    >
      {/* CONTENEDOR RESPONSIVE */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",  // <-- se amplía para web
          minHeight: "100%",
          padding: "0 20px",

          // RESPONSIVE TOTAL:
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "450px" }}>
          <Outlet />
        </div>
      </div>

      {/* NAV INFERIOR OCULTO EN WEB */}
      {!shouldHideNav && (
        <div style={{ width: "100%", maxWidth: "900px" }}>
          <BottomNav />
        </div>
      )}
    </div>
  );
}
