import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { savePatientData } from "../services/patientStorage";
import { register } from "../services/authService";
import type { User } from "../services/authService";
import { validateRut, formatRut, cleanRut } from "../utils/validators";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    rut: "", // RUT Paciente
    edad: "",
    password: "", // Pass Paciente
    confirmPassword: "",
    rol: "patient",
    estadoCivil: "",
    direccion: "",
    telefono: "",
    tipoDiabetes: "",
    tipoSangre: "",
    // Datos Cuidador / Emergencia
    emergenciaNombre: "",
    emergenciaRut: "", // RUT Cuidador
    emergenciaPassword: "", // Pass Cuidador
    emergenciaTelefono: "",
    emergenciaRelacion: "",
  });

  const [hasCaretaker, setHasCaretaker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Formateo automático de RUT
    if (name === "rut" || name === "emergenciaRut") {
      value = formatRut(value);
    }

    setForm({ ...form, [name]: value });
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 1. Paciente
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";

    if (!form.rut) newErrors.rut = "El RUT es obligatorio.";
    else if (!validateRut(form.rut)) newErrors.rut = "RUT inválido.";

    if (!form.password) newErrors.password = "La contraseña es obligatoria.";
    else if (form.password.length < 6) newErrors.password = "Mínimo 6 caracteres.";

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    // Datos opcionales importantes
    if (form.telefono && form.telefono.length < 8) newErrors.telefono = "Formato inválido.";
    if (!form.edad) newErrors.edad = "Requerido.";

    // 2. Cuidador (Si corresponde)
    if (form.rol === "patient" && hasCaretaker) {
      if (!form.emergenciaNombre.trim()) newErrors.emergenciaNombre = "Nombre del cuidador requerido.";

      if (!form.emergenciaRut) newErrors.emergenciaRut = "RUT del cuidador requerido.";
      else if (!validateRut(form.emergenciaRut)) newErrors.emergenciaRut = "RUT de cuidador inválido.";

      if (!form.emergenciaPassword) newErrors.emergenciaPassword = "Contraseña requerida.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    // 3. Registrar Paciente
    const newPatient: User = {
      id: Date.now().toString(),
      username: cleanRut(form.rut), // Guardamos RUT limpio como username
      password: form.password,
      name: form.nombre,
      // @ts-ignore
      role: form.rol
    };

    const patientRegistered = await register(newPatient);
    if (!patientRegistered) {
      alert("El RUT del paciente ya está registrado.");
      return;
    }

    // 4. Registrar Cuidador (automáticamente)
    if (form.rol === "patient" && hasCaretaker) {
      const newCaretaker: User = {
        id: (Date.now() + 1).toString(),
        username: cleanRut(form.emergenciaRut),
        password: form.emergenciaPassword,
        name: form.emergenciaNombre,
        role: "caretaker"
      };

      const caretakerRegistered = await register(newCaretaker);
      if (!caretakerRegistered) {
        alert("Advertencia: El paciente se creó, pero el RUT del cuidador ya existía. Verifica los datos.");
      } else {
        savePatientData(form);
      }
    } else {
      savePatientData(form);
    }

    navigate("/register-complete");
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "450px",
        margin: "0 auto",
        padding: "20px",
        paddingBottom: "80px"
      }}
    >
      <h2 style={{ fontSize: "28px", textAlign: "center", marginBottom: "5px" }}>
        Crear Cuenta
      </h2>

      <p style={{ color: "#666", textAlign: "center", marginBottom: "25px", fontSize: "15px" }}>
        Completa tu información y asigna a tu cuidador.
      </p>

      {/* CREDENCIALES PACIENTE */}
      <h3 style={sectionTitle}>👤 Tus Datos de Ingreso</h3>

      <div style={{ marginBottom: "15px" }}>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>Te estás registrando como:</p>
        <select style={input} name="rol" onChange={handleChange} value={form.rol}>
          <option value="patient">Paciente (con Cuidador)</option>
          <option value="caretaker">Cuidador (Independiente)</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input style={input} name="rut" placeholder="Tu RUT" onChange={handleChange} value={form.rut} maxLength={12} />
        {errors.rut && <span style={errorText}>{errors.rut}</span>}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input style={input} type="password" name="password" placeholder="Tu Contraseña" onChange={handleChange} />
        {errors.password && <span style={errorText}>{errors.password}</span>}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input style={input} type="password" name="confirmPassword" placeholder="Confirmar Tu Contraseña" onChange={handleChange} />
        {errors.confirmPassword && <span style={errorText}>{errors.confirmPassword}</span>}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input style={input} name="nombre" placeholder="Tu Nombre completo" onChange={handleChange} />
        {errors.nombre && <span style={errorText}>{errors.nombre}</span>}
      </div>


      {form.rol === "patient" && (
        <>
          {/* DATOS PERSONALES */}
          <h3 style={sectionTitle}>📋 Tus Datos Personales</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <input style={{ ...input, marginTop: "0" }} name="edad" placeholder="Edad" type="number" onChange={handleChange} />
              {errors.edad && <span style={errorText}>{errors.edad}</span>}
            </div>

            <select style={{ ...input, marginTop: "0" }} name="estadoCivil" onChange={handleChange}>
              <option value="">Estado civil</option>
              <option value="Soltero(a)">Soltero(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viudo(a)">Viudo(a)</option>
            </select>
          </div>
          <input style={input} name="direccion" placeholder="Dirección" onChange={handleChange} />

          <div style={{ marginBottom: "10px" }}>
            <input style={input} name="telefono" placeholder="Teléfono" onChange={handleChange} />
            {errors.telefono && <span style={errorText}>{errors.telefono}</span>}
          </div>

          {/* DATOS CLÍNICOS */}
          <h3 style={sectionTitle}>🩸 Datos Clínicos</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <select style={{ ...input, marginTop: "0" }} name="tipoDiabetes" onChange={handleChange}>
              <option value="">Diabetes...</option>
              <option value="Tipo 1">Tipo 1</option>
              <option value="Tipo 2">Tipo 2</option>
              <option value="Gestacional">Gestacional</option>
            </select>
            <select style={{ ...input, marginTop: "0" }} name="tipoSangre" onChange={handleChange}>
              <option value="">Sangre...</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="AB+">AB+</option>
            </select>
          </div>

          {/* DATOS CUIDADOR (OPCIONAL) */}
          <div style={{ marginTop: "30px", marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", color: "#1F4FFF" }}>
              <input
                type="checkbox"
                checked={hasCaretaker}
                onChange={(e) => setHasCaretaker(e.target.checked)}
                style={{ width: "20px", height: "20px" }}
              />
              Quiero asignar un Cuidador ahora
            </label>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "5px", marginLeft: "30px" }}>
              Activa esta opción si tienes un familiar o enfermera que te ayudará a monitorear tu salud.
            </p>
          </div>

          {hasCaretaker && (
            <div style={{ padding: "20px", background: "#EFF6FF", borderRadius: "16px", border: "1px dashed #1F4FFF" }}>
              <h3 style={{ ...sectionTitle, marginTop: 0, color: "#1F4FFF" }}>🛡️ Datos de tu Cuidador</h3>
              <p style={{ fontSize: "13px", color: "#555", marginBottom: "15px" }}>
                Crearemos una cuenta para él/ella automáticamente.
              </p>

              <div style={{ marginBottom: "10px" }}>
                <input style={input} name="emergenciaNombre" placeholder="Nombre Del Cuidador" onChange={handleChange} />
                {errors.emergenciaNombre && <span style={errorText}>{errors.emergenciaNombre}</span>}
              </div>

              <input style={input} name="emergenciaRelacion" placeholder="Relación (Ej: Hijo, Enfermera)" onChange={handleChange} />
              <input style={input} name="emergenciaTelefono" placeholder="Teléfono del Cuidador" onChange={handleChange} />

              <div style={{ height: "1px", background: "#D3DAEB", margin: "15px 0" }}></div>

              <p style={{ fontSize: "13px", fontWeight: "bold", color: "#1F4FFF", marginBottom: "5px" }}>Credenciales para el Cuidador:</p>

              <div style={{ marginBottom: "10px" }}>
                <input style={input} name="emergenciaRut" placeholder="RUT del Cuidador (Usuario)" onChange={handleChange} value={form.emergenciaRut} maxLength={12} />
                {errors.emergenciaRut && <span style={errorText}>{errors.emergenciaRut}</span>}
              </div>

              <div style={{ marginBottom: "10px" }}>
                <input style={input} type="password" name="emergenciaPassword" placeholder="Crear Contraseña para Cuidador" onChange={handleChange} />
                {errors.emergenciaPassword && <span style={errorText}>{errors.emergenciaPassword}</span>}
              </div>
            </div>
          )}
        </>
      )}

      <button style={btn} onClick={handleRegister}>
        Registrar
      </button>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={() => navigate("/login")}
          style={{ background: "none", border: "none", color: "#1F4FFF", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
        >
          ← Volver al login
        </button>
      </div>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "13px",
  borderRadius: "10px",
  border: "1px solid #D3D3D3",
  marginTop: "10px",
  fontSize: "16px",
};

const sectionTitle: React.CSSProperties = {
  textAlign: "left",
  marginTop: "20px",
  marginBottom: "8px",
  color: "#333",
  fontSize: "19px",
  fontWeight: 600,
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: "17px",
  borderRadius: "12px",
  backgroundColor: "#1F4FFF",
  color: "white",
  border: "none",
  marginTop: "30px",
  fontSize: "18px",
  cursor: "pointer",
};

const errorText: React.CSSProperties = {
  color: "#EF4444",
  fontSize: "12px",
  marginLeft: "5px",
  marginTop: "2px",
  display: "block"
};
