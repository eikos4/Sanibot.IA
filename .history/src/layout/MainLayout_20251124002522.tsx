import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {
  const location = useLocation();
  const hideNavRoutes = ["/", "/welcome", "/register"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <div className="layout-container">
      {/* Contenedor principal con scroll */}
      <main className="main-content">
        <div className="content-wrapper">
          <div className="content-inner">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Bottom Navigation - fixed en mobile */}
      {!shouldHideNav && (
        <nav className="bottom-nav-container">
          <BottomNav />
        </nav>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #FFFFFF;
          position: relative;
        }

        .main-content {
          flex: 1;
          display: flex;
          justify-content: center;
          width: 100%;
          overflow-y: auto;
          /* Espacio para el bottom nav en mobile */
          padding-bottom: ${shouldHideNav ? '0' : '80px'};
        }

        .content-wrapper {
          width: 100%;
          max-width: 1200px;
          padding: 16px;
          display: flex;
          justify-content: center;
        }

        .content-inner {
          width: 100%;
          max-width: 480px;
        }

        .bottom-nav-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: #FFFFFF;
          border-top: 1px solid #E5E7EB;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
          /* Soporte para notch de iOS */
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Tablets y pantallas medianas */
        @media (min-width: 768px) {
          .content-wrapper {
            padding: 24px;
          }

          .content-inner {
            max-width: 600px;
          }

          .main-content {
            padding-bottom: ${shouldHideNav ? '0' : '90px'};
          }
        }

        /* Desktop */
        @media (min-width: 1024px) {
          .content-wrapper {
            padding: 32px;
          }

          .content-inner {
            max-width: 700px;
          }

          .bottom-nav-container {
            position: static;
            border-top: none;
            box-shadow: none;
            padding-bottom: 0;
            max-width: 1200px;
            margin: 0 auto;
          }

          .main-content {
            padding-bottom: 0;
          }
        }

        /* Mejoras para Android */
        @media (max-width: 767px) {
          .layout-container {
            /* Prevenir bounce en Android Chrome */
            overscroll-behavior-y: contain;
          }

          .content-wrapper {
            padding: 12px;
          }

          /* Mejora de tap targets para móvil */
          button, a, [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* Dark mode support (opcional) */
        @media (prefers-color-scheme: dark) {
          .layout-container {
            background: #111827;
            color: #F9FAFB;
          }

          .bottom-nav-container {
            background: #1F2937;
            border-top-color: #374151;
          }
        }

        /* Mejoras de accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}