import { useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
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
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          minHeight: "100%",
        }}
      >
        {children}
      </div>

      {!shouldHideNav && <BottomNav />}
    </div>
  );
}
