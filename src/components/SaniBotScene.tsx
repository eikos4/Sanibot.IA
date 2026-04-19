import { useState, useEffect } from "react";

interface SaniBotSceneProps {
  onPress: () => void;
  isSpeaking?: boolean;
  userName?: string;
}

type SceneType = "dawn" | "clinic" | "lunch" | "afternoon" | "sunset" | "night" | "sleeping";

interface SceneConfig {
  type: SceneType;
  label: string;
  greeting: string;
  bgGradient: string;
  robotAccessory: string;
  robotExpression: "happy" | "sleepy" | "professional" | "relaxed";
  elements: string[];
  ambientColor: string;
}

const getSceneByHour = (): SceneConfig => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) {
    return {
      type: "dawn",
      label: "Amanecer",
      greeting: "¡Buenos días! ¿Cómo amaneciste?",
      bgGradient: "linear-gradient(180deg, #FDE68A 0%, #FBBF24 30%, #F97316 70%, #FB923C 100%)",
      robotAccessory: "stretching",
      robotExpression: "happy",
      elements: ["sun-rising", "clouds-pink", "birds"],
      ambientColor: "#FBBF24"
    };
  }

  if (hour >= 8 && hour < 12) {
    return {
      type: "clinic",
      label: "Clínica",
      greeting: "Hora de revisar tu salud",
      bgGradient: "linear-gradient(180deg, #DBEAFE 0%, #BFDBFE 50%, #93C5FD 100%)",
      robotAccessory: "doctor",
      robotExpression: "professional",
      elements: ["medical-cross", "heartbeat", "clipboard"],
      ambientColor: "#3B82F6"
    };
  }

  if (hour >= 12 && hour < 14) {
    return {
      type: "lunch",
      label: "Almuerzo",
      greeting: "¿Ya almorzaste? Recuerda comer sano",
      bgGradient: "linear-gradient(180deg, #FEF3C7 0%, #FDE68A 50%, #FBBF24 100%)",
      robotAccessory: "chef",
      robotExpression: "happy",
      elements: ["plate", "vegetables", "steam"],
      ambientColor: "#F59E0B"
    };
  }

  if (hour >= 14 && hour < 18) {
    return {
      type: "afternoon",
      label: "Tarde",
      greeting: "¿Cómo va tu tarde?",
      bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%)",
      robotAccessory: "reading",
      robotExpression: "relaxed",
      elements: ["plant", "book", "coffee"],
      ambientColor: "#0EA5E9"
    };
  }

  if (hour >= 18 && hour < 20) {
    return {
      type: "sunset",
      label: "Atardecer",
      greeting: "Hora de relajarse",
      bgGradient: "linear-gradient(180deg, #FED7AA 0%, #FDBA74 30%, #FB923C 60%, #C2410C 100%)",
      robotAccessory: "tea",
      robotExpression: "relaxed",
      elements: ["sun-setting", "clouds-orange", "window"],
      ambientColor: "#EA580C"
    };
  }

  if (hour >= 20 && hour < 22) {
    return {
      type: "night",
      label: "Noche",
      greeting: "¿Tomaste tus medicamentos?",
      bgGradient: "linear-gradient(180deg, #312E81 0%, #1E1B4B 50%, #0F172A 100%)",
      robotAccessory: "pajamas",
      robotExpression: "relaxed",
      elements: ["moon", "stars", "lamp"],
      ambientColor: "#6366F1"
    };
  }

  // 22:00 - 5:00 Sleeping
  return {
    type: "sleeping",
    label: "Durmiendo",
    greeting: "Descansa bien...",
    bgGradient: "linear-gradient(180deg, #1E1B4B 0%, #0F172A 50%, #020617 100%)",
    robotAccessory: "sleeping",
    robotExpression: "sleepy",
    elements: ["moon", "stars", "zzz", "bed"],
    ambientColor: "#4F46E5"
  };
};

export default function SaniBotScene({ onPress, isSpeaking = false, userName = "Usuario" }: SaniBotSceneProps) {
  const [scene, setScene] = useState<SceneConfig>(getSceneByHour());
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    // Update scene every minute
    const interval = setInterval(() => setScene(getSceneByHour()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePress = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    onPress();
  };

  return (
    <div className="scene-container">
      {/* Background */}
      <div className="scene-bg" style={{ background: scene.bgGradient }} />
      
      {/* Ambient Elements */}
      <div className="scene-elements">
        {scene.type === "dawn" && <DawnElements />}
        {scene.type === "clinic" && <ClinicElements />}
        {scene.type === "lunch" && <LunchElements />}
        {scene.type === "afternoon" && <AfternoonElements />}
        {scene.type === "sunset" && <SunsetElements />}
        {scene.type === "night" && <NightElements />}
        {scene.type === "sleeping" && <SleepingElements />}
      </div>

      {/* Robot Container */}
      <button 
        type="button" 
        className={`scene-robot-btn ${isPressed ? "pressed" : ""}`}
        onClick={handlePress}
      >
        <div className="scene-robot-glow" style={{ background: scene.ambientColor }} />
        
        {/* Robot with Accessories */}
        <div className={`scene-robot ${isSpeaking ? "talking" : ""} ${scene.type}`}>
          <img src="/robot.png" alt="SaniBot" className="scene-robot-img" />
          
          {/* Accessories Overlay */}
          {scene.robotAccessory === "doctor" && <DoctorAccessory />}
          {scene.robotAccessory === "chef" && <ChefAccessory />}
          {scene.robotAccessory === "pajamas" && <PajamasAccessory />}
          {scene.robotAccessory === "sleeping" && <SleepingAccessory />}
          {scene.robotAccessory === "tea" && <TeaAccessory />}
          {scene.robotAccessory === "reading" && <ReadingAccessory />}
          {scene.robotAccessory === "stretching" && <StretchingAccessory />}
        </div>

        <div className="scene-robot-pulse" style={{ borderColor: scene.ambientColor }} />
      </button>

      {/* Scene Label */}
      <div className="scene-label" style={{ background: `${scene.ambientColor}20`, color: scene.ambientColor }}>
        {scene.label}
      </div>

      <style>{`
        .scene-container {
          position: relative;
          width: 100%;
          height: 220px;
          border-radius: 28px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .scene-bg {
          position: absolute;
          inset: 0;
          transition: background 1s ease;
        }

        .scene-elements {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .scene-robot-btn {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: none;
          border: none;
          cursor: pointer;
          z-index: 10;
          transition: transform 0.2s ease;
        }

        .scene-robot-btn.pressed {
          transform: translateX(-50%) scale(0.95);
        }

        .scene-robot-glow {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          filter: blur(30px);
          opacity: 0.4;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
        }

        .scene-robot {
          position: relative;
          width: 100px;
          height: 100px;
        }

        .scene-robot-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 8px 20px rgba(0,0,0,0.3));
          transition: transform 0.3s ease;
        }

        .scene-robot.talking .scene-robot-img {
          animation: robotTalk 0.3s ease-in-out infinite;
        }

        .scene-robot.sleeping .scene-robot-img {
          animation: robotSleep 3s ease-in-out infinite;
        }

        @keyframes robotTalk {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.02) rotate(-2deg); }
          75% { transform: scale(1.02) rotate(2deg); }
        }

        @keyframes robotSleep {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(3px) rotate(-5deg); }
        }

        .scene-robot-pulse {
          position: absolute;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 3px solid;
          opacity: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulseRing 2s ease-out infinite;
        }

        @keyframes pulseRing {
          0% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.8); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.4); }
        }

        .scene-label {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          backdrop-filter: blur(10px);
        }

        /* ========== DAWN ELEMENTS ========== */
        .dawn-sun {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, #FDE68A 0%, #FBBF24 50%, transparent 70%);
          border-radius: 50%;
          animation: sunRise 4s ease-out forwards, sunGlow 3s ease-in-out infinite;
        }

        @keyframes sunRise {
          from { bottom: -40px; opacity: 0.5; }
          to { bottom: 60px; opacity: 1; }
        }

        @keyframes sunGlow {
          0%, 100% { box-shadow: 0 0 40px #FBBF24, 0 0 80px #FDE68A; }
          50% { box-shadow: 0 0 60px #FBBF24, 0 0 100px #FDE68A; }
        }

        .dawn-cloud {
          position: absolute;
          background: linear-gradient(180deg, #FECACA 0%, #FCA5A5 100%);
          border-radius: 50px;
          opacity: 0.8;
        }

        .dawn-cloud-1 { width: 60px; height: 20px; top: 30px; left: 10%; animation: cloudFloat 8s ease-in-out infinite; }
        .dawn-cloud-2 { width: 80px; height: 25px; top: 50px; right: 15%; animation: cloudFloat 10s ease-in-out infinite reverse; }
        .dawn-cloud-3 { width: 50px; height: 18px; top: 70px; left: 25%; animation: cloudFloat 7s ease-in-out infinite 1s; }

        @keyframes cloudFloat {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(15px); }
        }

        .dawn-bird {
          position: absolute;
          font-size: 14px;
          animation: birdFly 6s linear infinite;
        }

        .dawn-bird-1 { top: 40px; left: -20px; animation-delay: 0s; }
        .dawn-bird-2 { top: 60px; left: -30px; animation-delay: 2s; }
        .dawn-bird-3 { top: 35px; left: -10px; animation-delay: 4s; }

        @keyframes birdFly {
          from { transform: translateX(0); }
          to { transform: translateX(calc(100vw + 50px)); }
        }

        /* ========== CLINIC ELEMENTS ========== */
        .clinic-cross {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #EF4444;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          animation: crossPulse 2s ease-in-out infinite;
        }

        @keyframes crossPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .clinic-heartbeat {
          position: absolute;
          top: 25px;
          right: 60px;
          width: 80px;
          height: 30px;
        }

        .clinic-heartbeat svg {
          width: 100%;
          height: 100%;
        }

        .heartbeat-line {
          stroke: #EF4444;
          stroke-width: 2;
          fill: none;
          stroke-dasharray: 200;
          animation: heartbeatDraw 1.5s ease-in-out infinite;
        }

        @keyframes heartbeatDraw {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }

        .clinic-clipboard {
          position: absolute;
          bottom: 30px;
          right: 20px;
          font-size: 30px;
          animation: clipboardBounce 3s ease-in-out infinite;
        }

        @keyframes clipboardBounce {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .clinic-bubble {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0.6;
        }

        .clinic-bubble-1 { width: 10px; height: 10px; top: 80px; left: 15%; animation: bubbleFloat 4s ease-in-out infinite; }
        .clinic-bubble-2 { width: 15px; height: 15px; top: 100px; left: 25%; animation: bubbleFloat 5s ease-in-out infinite 1s; }
        .clinic-bubble-3 { width: 8px; height: 8px; top: 90px; right: 30%; animation: bubbleFloat 3s ease-in-out infinite 0.5s; }

        @keyframes bubbleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.8; }
        }

        /* ========== LUNCH ELEMENTS ========== */
        .lunch-plate {
          position: absolute;
          bottom: 20px;
          left: 20px;
          font-size: 40px;
          animation: plateWiggle 3s ease-in-out infinite;
        }

        @keyframes plateWiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        .lunch-veggie {
          position: absolute;
          font-size: 24px;
          animation: veggieFloat 4s ease-in-out infinite;
        }

        .lunch-veggie-1 { top: 30px; left: 30%; }
        .lunch-veggie-2 { top: 50px; right: 25%; animation-delay: 1s; }
        .lunch-veggie-3 { top: 40px; left: 15%; animation-delay: 2s; }

        @keyframes veggieFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
        }

        .lunch-steam {
          position: absolute;
          bottom: 70px;
          left: 35px;
          width: 30px;
          height: 40px;
        }

        .steam-line {
          position: absolute;
          width: 3px;
          height: 20px;
          background: rgba(255,255,255,0.6);
          border-radius: 3px;
          animation: steamRise 2s ease-out infinite;
        }

        .steam-line:nth-child(1) { left: 5px; animation-delay: 0s; }
        .steam-line:nth-child(2) { left: 13px; animation-delay: 0.5s; }
        .steam-line:nth-child(3) { left: 21px; animation-delay: 1s; }

        @keyframes steamRise {
          0% { opacity: 0; transform: translateY(0) scaleY(0.5); }
          50% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-30px) scaleY(1); }
        }

        /* ========== AFTERNOON ELEMENTS ========== */
        .afternoon-plant {
          position: absolute;
          bottom: 10px;
          left: 15px;
          font-size: 50px;
        }

        .afternoon-book {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 35px;
          animation: bookFloat 4s ease-in-out infinite;
        }

        @keyframes bookFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-5px) rotate(0deg); }
        }

        .afternoon-coffee {
          position: absolute;
          top: 30px;
          right: 30px;
          font-size: 30px;
          animation: coffeeWiggle 3s ease-in-out infinite;
        }

        @keyframes coffeeWiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .afternoon-sparkle {
          position: absolute;
          font-size: 12px;
          animation: sparkle 2s ease-in-out infinite;
        }

        .afternoon-sparkle-1 { top: 50px; left: 20%; }
        .afternoon-sparkle-2 { top: 70px; right: 40%; animation-delay: 0.5s; }
        .afternoon-sparkle-3 { top: 40px; left: 40%; animation-delay: 1s; }

        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* ========== SUNSET ELEMENTS ========== */
        .sunset-sun {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, #FDBA74 0%, #F97316 40%, #C2410C 70%, transparent 80%);
          border-radius: 50%;
          animation: sunsetGlow 4s ease-in-out infinite;
        }

        @keyframes sunsetGlow {
          0%, 100% { box-shadow: 0 0 50px #F97316, 0 0 100px #FDBA74; }
          50% { box-shadow: 0 0 70px #F97316, 0 0 120px #FDBA74; }
        }

        .sunset-cloud {
          position: absolute;
          background: linear-gradient(180deg, #FDBA74 0%, #F97316 100%);
          border-radius: 50px;
          opacity: 0.7;
        }

        .sunset-cloud-1 { width: 70px; height: 22px; top: 25px; left: 10%; animation: cloudFloat 9s ease-in-out infinite; }
        .sunset-cloud-2 { width: 90px; height: 28px; top: 45px; right: 10%; animation: cloudFloat 11s ease-in-out infinite reverse; }

        .sunset-window {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 50px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          border: 3px solid rgba(255,255,255,0.4);
          backdrop-filter: blur(5px);
        }

        .sunset-window::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255,255,255,0.4);
        }

        .sunset-window::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 3px;
          background: rgba(255,255,255,0.4);
        }

        /* ========== NIGHT ELEMENTS ========== */
        .night-moon {
          position: absolute;
          top: 20px;
          right: 25px;
          width: 50px;
          height: 50px;
          background: radial-gradient(circle at 30% 30%, #FEF9C3 0%, #FDE68A 50%, #FBBF24 100%);
          border-radius: 50%;
          box-shadow: 0 0 30px #FDE68A, 0 0 60px rgba(253,230,138,0.5);
          animation: moonGlow 4s ease-in-out infinite;
        }

        @keyframes moonGlow {
          0%, 100% { box-shadow: 0 0 30px #FDE68A, 0 0 60px rgba(253,230,138,0.5); }
          50% { box-shadow: 0 0 40px #FDE68A, 0 0 80px rgba(253,230,138,0.6); }
        }

        .night-star {
          position: absolute;
          color: white;
          font-size: 10px;
          animation: starTwinkle 2s ease-in-out infinite;
        }

        .night-star-1 { top: 30px; left: 15%; }
        .night-star-2 { top: 50px; left: 30%; animation-delay: 0.5s; }
        .night-star-3 { top: 25px; left: 45%; animation-delay: 1s; }
        .night-star-4 { top: 60px; right: 35%; animation-delay: 1.5s; }
        .night-star-5 { top: 40px; right: 20%; animation-delay: 0.3s; }

        @keyframes starTwinkle {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .night-lamp {
          position: absolute;
          bottom: 15px;
          left: 20px;
          font-size: 35px;
          filter: drop-shadow(0 0 15px #FDE68A);
        }

        /* ========== SLEEPING ELEMENTS ========== */
        .sleeping-moon {
          position: absolute;
          top: 15px;
          right: 20px;
          width: 45px;
          height: 45px;
          background: radial-gradient(circle at 30% 30%, #E0E7FF 0%, #C7D2FE 50%, #A5B4FC 100%);
          border-radius: 50%;
          box-shadow: 0 0 25px #C7D2FE;
        }

        .sleeping-star {
          position: absolute;
          color: #C7D2FE;
          font-size: 8px;
          animation: starTwinkle 3s ease-in-out infinite;
        }

        .sleeping-star-1 { top: 25px; left: 20%; }
        .sleeping-star-2 { top: 40px; left: 35%; animation-delay: 1s; }
        .sleeping-star-3 { top: 20px; left: 50%; animation-delay: 2s; }
        .sleeping-star-4 { top: 55px; right: 40%; animation-delay: 0.5s; }

        .sleeping-zzz {
          position: absolute;
          top: 60px;
          right: 35%;
          font-size: 20px;
          color: #A5B4FC;
          animation: zzzFloat 3s ease-in-out infinite;
        }

        .sleeping-zzz-2 {
          top: 45px;
          right: 30%;
          font-size: 16px;
          animation-delay: 1s;
        }

        .sleeping-zzz-3 {
          top: 35px;
          right: 25%;
          font-size: 12px;
          animation-delay: 2s;
        }

        @keyframes zzzFloat {
          0% { opacity: 0; transform: translateY(10px) translateX(0); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-20px) translateX(15px); }
        }

        .sleeping-bed {
          position: absolute;
          bottom: 10px;
          left: 15px;
          font-size: 40px;
        }

        /* ========== ACCESSORIES ========== */
        .accessory {
          position: absolute;
          pointer-events: none;
        }

        .doctor-coat {
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 24px;
        }

        .doctor-stethoscope {
          position: absolute;
          bottom: 10px;
          right: -5px;
          font-size: 20px;
          animation: stethoscopeSwing 3s ease-in-out infinite;
        }

        @keyframes stethoscopeSwing {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }

        .chef-hat {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 28px;
        }

        .chef-spoon {
          position: absolute;
          bottom: 5px;
          right: -10px;
          font-size: 22px;
          animation: spoonStir 2s ease-in-out infinite;
        }

        @keyframes spoonStir {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }

        .pajamas-cap {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 26px;
        }

        .sleeping-cap {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%) rotate(-15deg);
          font-size: 28px;
        }

        .sleeping-pillow {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 30px;
        }

        .tea-cup {
          position: absolute;
          bottom: 5px;
          right: -15px;
          font-size: 24px;
          animation: teaSip 4s ease-in-out infinite;
        }

        @keyframes teaSip {
          0%, 80%, 100% { transform: translateY(0); }
          90% { transform: translateY(-10px); }
        }

        .reading-glasses {
          position: absolute;
          top: 25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 18px;
        }

        .reading-book {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          font-size: 24px;
        }

        .stretching-arms {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 20px;
          animation: stretchArms 3s ease-in-out infinite;
        }

        @keyframes stretchArms {
          0%, 100% { transform: translateX(-50%) scaleX(1); }
          50% { transform: translateX(-50%) scaleX(1.3); }
        }
      `}</style>
    </div>
  );
}

// ========== SCENE ELEMENTS COMPONENTS ==========

function DawnElements() {
  return (
    <>
      <div className="dawn-sun" />
      <div className="dawn-cloud dawn-cloud-1" />
      <div className="dawn-cloud dawn-cloud-2" />
      <div className="dawn-cloud dawn-cloud-3" />
      <div className="dawn-bird dawn-bird-1">🐦</div>
      <div className="dawn-bird dawn-bird-2">🐦</div>
      <div className="dawn-bird dawn-bird-3">🐦</div>
    </>
  );
}

function ClinicElements() {
  return (
    <>
      <div className="clinic-cross">➕</div>
      <div className="clinic-heartbeat">
        <svg viewBox="0 0 100 30">
          <path className="heartbeat-line" d="M0,15 L20,15 L25,5 L30,25 L35,10 L40,20 L45,15 L100,15" />
        </svg>
      </div>
      <div className="clinic-clipboard">📋</div>
      <div className="clinic-bubble clinic-bubble-1" />
      <div className="clinic-bubble clinic-bubble-2" />
      <div className="clinic-bubble clinic-bubble-3" />
    </>
  );
}

function LunchElements() {
  return (
    <>
      <div className="lunch-plate">🍽️</div>
      <div className="lunch-veggie lunch-veggie-1">🥗</div>
      <div className="lunch-veggie lunch-veggie-2">🥕</div>
      <div className="lunch-veggie lunch-veggie-3">🥦</div>
      <div className="lunch-steam">
        <div className="steam-line" />
        <div className="steam-line" />
        <div className="steam-line" />
      </div>
    </>
  );
}

function AfternoonElements() {
  return (
    <>
      <div className="afternoon-plant">🪴</div>
      <div className="afternoon-book">📖</div>
      <div className="afternoon-coffee">☕</div>
      <div className="afternoon-sparkle afternoon-sparkle-1">✨</div>
      <div className="afternoon-sparkle afternoon-sparkle-2">✨</div>
      <div className="afternoon-sparkle afternoon-sparkle-3">✨</div>
    </>
  );
}

function SunsetElements() {
  return (
    <>
      <div className="sunset-sun" />
      <div className="sunset-cloud sunset-cloud-1" />
      <div className="sunset-cloud sunset-cloud-2" />
      <div className="sunset-window" />
    </>
  );
}

function NightElements() {
  return (
    <>
      <div className="night-moon" />
      <div className="night-star night-star-1">⭐</div>
      <div className="night-star night-star-2">⭐</div>
      <div className="night-star night-star-3">⭐</div>
      <div className="night-star night-star-4">⭐</div>
      <div className="night-star night-star-5">⭐</div>
      <div className="night-lamp">🛋️</div>
    </>
  );
}

function SleepingElements() {
  return (
    <>
      <div className="sleeping-moon" />
      <div className="sleeping-star sleeping-star-1">✦</div>
      <div className="sleeping-star sleeping-star-2">✦</div>
      <div className="sleeping-star sleeping-star-3">✦</div>
      <div className="sleeping-star sleeping-star-4">✦</div>
      <div className="sleeping-zzz">💤</div>
      <div className="sleeping-zzz sleeping-zzz-2">💤</div>
      <div className="sleeping-zzz sleeping-zzz-3">💤</div>
      <div className="sleeping-bed">🛏️</div>
    </>
  );
}

// ========== ACCESSORY COMPONENTS ==========

function DoctorAccessory() {
  return (
    <>
      <div className="accessory doctor-coat">🥼</div>
      <div className="accessory doctor-stethoscope">🩺</div>
    </>
  );
}

function ChefAccessory() {
  return (
    <>
      <div className="accessory chef-hat">👨‍🍳</div>
      <div className="accessory chef-spoon">🥄</div>
    </>
  );
}

function PajamasAccessory() {
  return (
    <div className="accessory pajamas-cap">🧢</div>
  );
}

function SleepingAccessory() {
  return (
    <>
      <div className="accessory sleeping-cap">😴</div>
      <div className="accessory sleeping-pillow">🛌</div>
    </>
  );
}

function TeaAccessory() {
  return (
    <div className="accessory tea-cup">🍵</div>
  );
}

function ReadingAccessory() {
  return (
    <>
      <div className="accessory reading-glasses">👓</div>
      <div className="accessory reading-book">📚</div>
    </>
  );
}

function StretchingAccessory() {
  return (
    <div className="accessory stretching-arms">🙆</div>
  );
}
