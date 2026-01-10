import { useState } from "react";

export default function Glucose() {
  const [value, setValue] = useState("");

  const save = () => {
    if (!value) return alert("Debes ingresar un valor");

    const record = {
      fecha: new Date().toLocaleString(),
      valor: value,
    };

    // Guardar en localStorage
    const history = JSON.parse(localStorage.getItem("glucoseHistory") || "[]");
    history.push(record);
    localStorage.setItem("glucoseHistory", JSON.stringify(history));

    alert("Glicemia registrada correctamente ✔");
    setValue("");
  };

  return (
    <div style={container}>
      {/* 🤖 SaniBot Educativo */}
      <div style={saniBotWrap}>
        <img src="/robot.png" style={saniBot} alt="SaniBot" />
        <div style={saniBubble}>
          ¡Hola! Soy SaniBot 🩺  
          Registrar tu glicemia te ayuda a controlar mejor tu diabetes.  
          <br /><br />
          👉 Ingresas tu nivel de glucosa en mg/dL  
          👉 Yo guardaré cada registro  
          👉 Luego podrás ver tu historial y detectar patrones  
        </div>
      </div>

      {/* TÍTULO */}
      <h2 style={title}>Registrar Glicemia</h2>

      <p style={subtitle}>
        Ingresa tu nivel de glucosa en sangre.  
        Esto permite un seguimiento adecuado y personalizado.
      </p>

      {/* INPUT */}
      <div style={inputCard}>
        <label style={label}>Valor de glucosa (mg/dL)</label>
        <input
          type="number"
          value={value}
          placeholder="Ej: 110"
          style={input}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      {/* BOTÓN */}
      <button style={btn} onClick={save}>
        Guardar Registro
      </button>

      {/* INFO CLÍNICA */}
      <div style={infoBox}>
        <h4 style={{ margin: "0 0 6px" }}>ℹ️ Rango de referencia</h4>
        <p style={{ margin: 0, color: "#555" }}>
          - Normal en ayunas: <b>70–99 mg/dL</b>  
          - Prediabetes: <b>100–125 mg/dL</b>  
          - Diabetes: <b>≥ 126 mg/dL</b>
        </p>
      </div>

      {/* Animaciones */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
}

/* ================= ESTILOS ================= */

const container = {
  padding: "20px",
  maxWidth: "450px",
  margin: "0 auto",
  textAlign: "center",
};

const saniBotWrap = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  marginBottom: "20px",
};

const saniBot = {
  width: "75px",
  animation: "float 3s ease-in-out infinite",
};

const saniBubble = {
  background: "#E8F0FF",
  padding: "12px 15px",
  borderRadius: "14px",
  textAlign: "left",
  fontSize: "14px",
  border: "1px solid #C6D8FF",
  maxWidth: "280px",
};

const title = {
  fontSize: "26px",
  margin: "0 0 6px",
};

const subtitle = {
  color: "#666",
  fontSize: "15px",
  marginBottom: "25px",
};

const inputCard = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginBottom: "20px",
  textAlign: "left",
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "6px",
  display: "block",
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "16px",
  marginTop: "5px",
};

const btn = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#1F4FFF",
  color: "white",
  borderRadius: "12px",
  border: "none",
  marginTop: "10px",
  fontSize: "18px",
  cursor: "pointer",
};

const infoBox = {
  marginTop: "25px",
  padding: "15px",
  background: "#F3F6FF",
  borderRadius: "10px",
  textAlign: "left",
};
