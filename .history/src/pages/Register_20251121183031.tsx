import { useState } from "react";
import MainLayout from "../layout/MainLayout";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    edad: "",
    estadoCivil: "",
    tipoDiabetes: "",
    tipoSangre: "",
    contactoNombre: "",
    contactoTelefono: "",
    contactoRelacion: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Datos registrados:", form);
    window.location.href = "/home";
  };

  return (
    <MainLayout>
      <h2 style={{ textAlign: "center" }}>Crear Perfil</h2>
      <p style={{ textAlign: "center", marginBottom: "20px", color: "#555" }}>
        Completa tu información para comenzar
      </p>

      <div style={{ width: "100%" }}>
        <h3>Datos personales</h3>

        <input name="nombre" placeholder="Nombre completo" onChange={handleChange} style={inputStyle} />
        <input name="rut" placeholder="RUT" onChange={handleChange} style={inputStyle} />
        <input name="edad" placeholder="Edad" type="number" onChange={handleChange} style={inputStyle} />

        <select name="estadoCivil" onChange={handleChange} style={inputStyle} defaultValue="">
          <option value="" disabled>Estado civil</option>
          <option value="soltero">Soltero(a)</option>
          <option value="casado">Casado(a)</option>
          <option value="viudo">Viudo(a)</option>
        </select>

        <h3>Información médica</h3>

        <select name="tipoDiabetes" onChange={handleChange} style={inputStyle} defaultValue="">
          <option value="" disabled>Tipo de diabetes</option>
          <option value="tipo1">Tipo 1</option>
          <option value="tipo2">Tipo 2</option>
          <option value="gestacional">Gestacional</option>
        </select>

        <select name="tipoSangre" onChange={handleChange} style={inputStyle} defaultValue="">
          <option value="" disabled>Tipo de sangre</option>
          <option>O+</option><option>O-</option>
          <option>A+</option><option>A-</option>
          <option>B+</option><option>B-</option>
          <option>AB+</option><option>AB-</option>
        </select>

        <h3>Contacto de emergencia</h3>

        <input name="contactoNombre" placeholder="Nombre contacto" onChange={handleChange} style={inputStyle} />
        <input name="contactoTelefono" placeholder="Teléfono" onChange={handleChange} style={inputStyle} />
        <input name="contactoRelacion" placeholder="Relación" onChange={handleChange} style={inputStyle} />

        <button
          onClick={handleSubmit}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "15px",
            backgroundColor: "#1F4FFF",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
          }}
        >
          Continuar
        </button>
      </div>
    </MainLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "16px",
};
