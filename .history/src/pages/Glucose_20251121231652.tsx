import { useState } from "react";

export default function Glucose() {
  const [value, setValue] = useState("");

  const save = () => {
    console.log("Glicemia registrada:", value);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Registrar Glicemia</h2>
      <p style={{ color: "#666" }}>Ingresa tu nivel de glucosa</p>

      <input
        type="number"
        placeholder="mg/dL"
        style={input}
        onChange={(e) => setValue(e.target.value)}
      />

      <button style={btn} onClick={save}>
        Guardar
      </button>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const btn = {
  width: "100%",
  padding: "15px",
  backgroundColor: "#1F4FFF",
  color: "white",
  borderRadius: "12px",
  border: "none",
  marginTop: "20px",
  fontSize: "18px",
};
