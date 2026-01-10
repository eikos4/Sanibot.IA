import { useState } from "react";

export default function Glucose() {
  const [value, setValue] = useState("");

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Registro de Glicemia</h2>

      <input
        type="number"
        placeholder="Nivel de glucosa (mg/dL)"
        style={input}
        onChange={(e) => setValue(e.target.value)}
      />

      <button style={btn}>Guardar registro</button>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "10px",
  marginTop: "10px",
};

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
