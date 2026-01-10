import { useState } from "react";

export default function Food() {
  const [text, setText] = useState("");

  const save = () => {
    console.log("Comida:", text);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Registro de Alimentación</h2>

      <textarea
        placeholder="¿Qué comiste hoy?"
        style={{
          width: "100%",
          height: "120px",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid #ccc",
          marginTop: "10px",
        }}
        onChange={(e) => setText(e.target.value)}
      />

      <button style={btn} onClick={save}>Guardar</button>
      <button style={{ ...btn, backgroundColor: "#10B981" }}>
        🎤 Dictar por voz
      </button>
    </div>
  );
}

const btn = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#1F4FFF",
  color: "white",
  fontSize: "18px",
  borderRadius: "12px",
  marginTop: "20px",
  border: "none",
};
