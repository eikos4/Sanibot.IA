import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import SaniBot from "../components/SaniBot";
// @ts-ignore
import SimulatedCall from "../components/SimulatedCall";
import { getMedicines } from "../services/medicineStorage";
import type { Medicine } from "../services/medicineStorage";

export default function MainLayout() {
  const location = useLocation();
  const hideNavRoutes = ["/", "/welcome", "/register"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  const [isDesktop, setIsDesktop] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callMessage, setCallMessage] = useState("");
  const [callerName, setCallerName] = useState("SaniBot");

  useEffect(() => {
    const check = () =>
      setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  // AUTOMATIZACIÓN DE RECORDATORIOS
  useEffect(() => {
    const checkMedicines = () => {
      // Helper para chequear hora
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;

      const isTimeMatch = (targetTime: string) => targetTime === currentTime;
      const todayStr = now.toDateString();

      // 1. CHECK MEDICINAS
      const meds: Medicine[] = getMedicines();

      meds.forEach(med => {
        // Soporte para estructura nueva (horarios[]) y antigua (horario)
        // @ts-ignore
        const times = med.horarios || (med.horario ? [med.horario] : []);

        times.forEach((t: string) => {
          const alertKey = `alert_${todayStr}_${med.id}_${t}`;
          if (isTimeMatch(t) && !localStorage.getItem(alertKey)) {
            setCallMessage(`Hola. Es hora de tu medicamento: ${med.nombre}. Recuerda registrarlo.`);
            setCallerName("Enfermera Virtual");
            setCallActive(true);
            localStorage.setItem(alertKey, "true");
          }
        });
      });

      // 2. CHECK ALIMENTACIÓN (DIETA)
      try {
        const dietPlan = JSON.parse(localStorage.getItem("glucobot_diet_plan") || "[]");
        dietPlan.forEach((meal: any) => {
          if (!meal.enabled) return;

          const alertKey = `diet_alert_${todayStr}_${meal.id}`;

          if (isTimeMatch(meal.time) && !localStorage.getItem(alertKey)) {
            setCallMessage(`Hola. Es hora de tu ${meal.type}: ${meal.description}. Provecho.`);
            setCallerName("Nutricionista Virtual");
            setCallActive(true);
            localStorage.setItem(alertKey, "true");
          }
        });
      } catch (e) { console.error("Error checking diet", e); }

      // 3. CHECK HIDRATACIÓN (Regla Inteligente)
      if (parseInt(currentHour) >= 18 && parseInt(currentHour) <= 20) {
        // Entre las 18 y las 20, si ha tomado menos de 4 vasos
        const hydrationKey = `hydration_${todayStr}`;
        const count = parseInt(localStorage.getItem(hydrationKey) || "0");
        const alertKey = `hydration_alert_${todayStr}`;

        if (count < 4 && !localStorage.getItem(alertKey)) {
          setCallMessage("¡Hola! He notado que has bebido poca agua hoy. Tu cuerpo necesita hidratarse. Por favor, ve a buscar un vaso de agua ahora.");
          setCallerName("SaniBot");
          setCallActive(true);
          localStorage.setItem(alertKey, "true");
        }
      }
    };

    const interval = setInterval(checkMedicines, 10000); // Chequear cada 10 segundos para demo (en prod sería 60s)
    return () => clearInterval(interval);
  }, []);

  // Define isMobile for clarity, equivalent to !isDesktop
  const isMobile = !isDesktop;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      {callActive && (
        <SimulatedCall
          callerName={callerName}
          message={callMessage}
          onClose={() => setCallActive(false)}
          onConfirm={() => {
            console.log("Medicina confirmada");
            // Aquí podríamos guardar en localStorage el registro histórico
            setCallActive(false);
          }}
        />
      )}

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
            // paddingBottom: shouldHideNav ? "0px" : "80px", // This padding is now handled by the main element
          }}
        >
          <main style={{ flex: 1, paddingBottom: isMobile && !shouldHideNav ? "80px" : "0" }}>
            <Outlet />
          </main>
          <SaniBot />
          {isMobile && !shouldHideNav && <BottomNav />}
        </div>
      )}

      {/* 🔻 NAV SOLO EN MOBILE */}
      {/* The BottomNav is now rendered inside the mobile div, so this line is removed */}
      {/* {!shouldHideNav && !isDesktop && <BottomNav />} */}
    </div>
  );
}
