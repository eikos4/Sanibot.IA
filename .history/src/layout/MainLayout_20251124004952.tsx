import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {
  const location = useLocation();
  const hideNavRoutes = ["/", "/welcome", "/register"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >

      {/* 🌐 DESKTOP → FULL WIDTH (NO LIMITAR) */}
      {isDesktop ? (
        <div style={{ width: "100%", height: "100%" }}>
          <Outlet />
        </div>
      ) : (
        /* 📱 MOBILE → PANTALLA REDUCIDA AL CENTRO */
        <div
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: "450px",
            paddingBottom: shouldHideNav ? "0px" : "80px",
          }}
        >
          <Outlet />
        </div>
      )}

      {/* 🔻 NAV SOLO EN MOBILE */}
      {!shouldHideNav && !isDesktop && <BottomNav />}
    </div>
  );
}
