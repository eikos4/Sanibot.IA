import { useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Rutas donde NO queremos mostrar la bottom nav
  const hideNavRoutes = ["/", "/welcome", "/register"];

  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#FFF",
        paddingBottom: shouldHideNav ? "0px" : "80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "20px",
        }}
      >
        {children}
      </div>

      {/* Mostrar barra solo si NO estamos en Splash, Welcome o Register */}
      {!shouldHideNav && <BottomNav />}
    </div>
  );
}
