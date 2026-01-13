import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import SaniBot from "../components/SaniBot";
// @ts-ignore
import SimulatedCall from "../components/SimulatedCall";
import { subscribeToMedicines } from "../services/medicineStorage";

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
    // Subscription for medicines
    const unsubscribeMeds = subscribeToMedicines((meds) => {
      const checkTime = () => {
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMinute = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;
        const todayStr = now.toDateString();

        meds.forEach(med => {
          const times = med.horarios || [];
          times.forEach((t: string) => {
            const alertKey = `alert_${todayStr}_${med.id}_${t}`;
            if (t === currentTime && !localStorage.getItem(alertKey)) {
              setCallMessage(`Hola. Es hora de tu medicamento: ${med.nombre}. Recuerda registrarlo.`);
              setCallerName("Enfermera Virtual");
              setCallActive(true);
              localStorage.setItem(alertKey, "true");
            }
          });
        });
      };

      // Check immediately and then every 10s
      checkTime();
      const interval = setInterval(checkTime, 10000);
      return () => clearInterval(interval);
    });

    // Other checks (Diet, Insulin, Hydration) - still local for now
    const checkOthers = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      const isTimeMatch = (targetTime: string) => targetTime === currentTime;
      const todayStr = now.toDateString();

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

      // 3. CHECK INSULINA
      try {
        const insulinPlan = JSON.parse(localStorage.getItem("glucobot_insulin_plan") || "[]");
        insulinPlan.forEach((dose: any) => {
          if (!dose.enabled) return;

          const alertKey = `insulin_alert_${todayStr}_${dose.id}`;

          if (isTimeMatch(dose.time) && !localStorage.getItem(alertKey)) {
            setCallMessage(`Atención. Es hora de tu insulina: ${dose.description}. Debes administrarte ${dose.units} unidades.`);
            setCallerName("SaniBot - Insulina");
            setCallActive(true);
            localStorage.setItem(alertKey, "true");
          }
        });
      } catch (e) { console.error("Error checking insulin", e); }

      // 4. CHECK HIDRATACIÓN (Regla Inteligente)
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
    }

    const intervalOthers = setInterval(checkOthers, 10000);

    return () => {
      // Unsubs are called when useEffect cleanup runs
      if (typeof unsubscribeMeds === 'function') unsubscribeMeds(); // Ensure it's a function
      clearInterval(intervalOthers);
    };
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
          userName={callerName}
          message={callMessage}
          onEndCall={() => {
            console.log("Medicina confirmada/Llamada finalizada");
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
          {isMobile && !shouldHideNav && <BottomNav />}
        </div>
      )}

      {/* 🤖 SANIBOT FLOTANTE (SIEMPRE VISIBLE) */}
      <SaniBot />

      {/* 🔻 NAV SOLO EN MOBILE */}
      {/* The BottomNav is now rendered inside the mobile div, so this line is removed */}
      {/* {!shouldHideNav && !isDesktop && <BottomNav />} */}
    </div>
  );
}
