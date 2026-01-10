import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({});

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ width: "100%" }}>
      <h2 style={{ textAlign: "center" }}>Crear Perfil</h2>
      <p style={{ textAlign: "center", marginBottom: 20 }}>
        Completa tu información para comenzar
      </p>

      <input style={input} name="nombre" placeholder="Nombre completo" onChange={handleChange} />
      <input style={input} name="rut" placeholder="RUT" onChange={handleChange} />
      <input style={input} name="edad" placeholder="Edad" onChange={handleChange} />

      <button
        style={{
          marginTop: 20,
          width: "100%",
          padding: 15,
          background: "#1F4FFF",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontSize: 18,
        }}
      >
        Continuar
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
