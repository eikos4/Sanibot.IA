import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    edad: "",
    estadoCivil: "",
    direccion: "",
    telefono: "",
    tipoDiabetes: "",
    tipoSangre: "",
    emergenciaNombre: "",
    emergenciaTelefono: "",
    emergenciaRelacion: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    console.log("Datos del paciente:", form);

    // Guardar en localStorage
    localStorage.setItem("glucobot_patient", JSON.stringify(form));

    // Ir a pantalla de confirmación
    window.location.href = "/register-complete";
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "450px",
        margin: "0 auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "26px", marginBottom: "10px" }}>
        Crear Ficha Clínica
      </h2>

      <p style={{ color: "#666", marginBottom: "25px" }}>
        Completa tu información para empezar a usar GlucoBot.
      </p>

      {/* DATOS PERSONALES */}
      <h3 style={section}>Datos Personales</h3>

      <input style={input} name="nombre" placeholder="Nombre completo" onChange={handleChange} />
      <input style={input} name="rut" placeholder="RUT" onChange={handleChange} />
      <input style={input} name="edad" placeholder="Edad" type="number" onChange={handleChange} />
      <select style={input} name="estadoCivil" onChange={handleChange}>
        <option value="">Estado civil</option>
        <option value="Soltero(a)">Soltero(a)</option>
        <option value="Casado(a)">Casado(a)</option>
        <option value="Divorciado(a)">Divorciado(a)</option>
        <option value="Viudo(a)">Viudo(a)</option>
      </select>

      <input style={input} name="direccion" placeholder="Dirección" onChange={handleChange} />
      <input style={input} name="telefono" placeholder="Teléfono" onChange={handleChange} />

      {/* DATOS CLÍNICOS */}
      <h3 style={section}>Datos Clínicos</h3>

      <select style={input} name="tipoDiabetes" onChange={handleChange}>
        <option value="">Tipo de diabetes</option>
        <option value="Tipo 1">Tipo 1</option>
        <option value="Tipo 2">Tipo 2</option>
        <option value="Gestacional">Gestacional</option>
        <option value="LADA">LADA</option>
      </select>

      <select style={input} name="tipoSangre" onChange={handleChange}>
        <option value="">Tipo de sangre</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
      </select>

      {/* CONTACTO DE EMERGENCIA */}
      <h3 style={section}>Contacto de Emergencia</h3>

      <input style={input} name="emergenciaNombre" placeholder="Nombre del contacto" onChange={handleChange} />
      <input style={input} name="emergenciaTelefono" placeholder="Teléfono" onChange={handleChange} />
      <input style={input} name="emergenciaRelacion" placeholder="Relación (hijo, esposo…)" onChange={handleChange} />

      <button style={btn} onClick={handleRegister}>
        Crear Perfil
      </button>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  marginTop: "10px",
  fontSize: "16px",
};

const section = {
  textAlign: "left",
  marginTop: "20px",
  marginBottom: "5px",
  fontSize: "18px",
};

const btn = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  backgroundColor: "#1F4FFF",
  color: "white",
  border: "none",
  marginTop: "30px",
  fontSize: "18px",
  cursor: "pointer",
};
