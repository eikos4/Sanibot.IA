import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { getPatientData } from "../services/patientStorage";
import { getAppointments } from "../services/appointmentStorage";
// @ts-ignore
import { getMedicines } from "../services/medicineStorage";
import { deleteAccount } from "../services/authService";
import BMICalculator from "../components/BMICalculator";

import type { PatientData } from "../services/patientStorage";

export default function Profile() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  const handleDeleteAccount = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y borrará todos tus datos.")) {
      const success = await deleteAccount();
      if (success) {
        alert("Cuenta eliminada correctamente.");
        navigate("/onboarding"); // Or login
      } else {
        alert("Hubo un error al eliminar la cuenta. Por favor intenta de nuevo o contacta soporte.");
      }
    }
  };
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      // @ts-ignore
      const data = await getPatientData();
      if (data) {
        setPatient(data as PatientData);
      }

      const apps = await getAppointments();
      setAppointments(apps);

      // @ts-ignore
      const meds = await getMedicines();
      setMedicines(meds);
    };
    fetchProfile();
  }, []);

  if (!patient) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Perfil no encontrado or cargando...</h2>
        <p>Por favor espera o completa tu registro.</p>
        <button style={btn} onClick={() => window.location.href = "/register"}>Registrarme</button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "80px" }}>
      <h2 style={{ textAlign: "center" }}>Mi Perfil</h2>

      <div style={card}>
        <div style={avatar}>{patient.nombre ? patient.nombre.charAt(0).toUpperCase() : "?"}</div>
        <h3 style={{ margin: "10px 0 5px" }}>{patient.nombre}</h3>
        <p style={{ color: "#666", margin: 0 }}>{patient.rut}</p>
      </div>

      <div style={section}>
        <h4 style={sectionTitle}>Datos Personales</h4>
        <div style={row}>
          <span>RUT:</span> <strong>{patient.rut}</strong>
        </div>
        <div style={row}>
          <span>Nacimiento:</span> <strong>{patient.fechaNacimiento}</strong>
        </div>
        <div style={row}>
          <span>Género:</span> <strong>{patient.genero}</strong>
        </div>
        <div style={row}>
          <span>Previsión:</span> <strong style={{ color: "#1F4FFF" }}>{patient.prevision}</strong>
        </div>
      </div>

      <div style={section}>
        <h4 style={sectionTitle}>Ficha Clínica</h4>
        <div style={row}>
          <span>Diabetes:</span> <strong style={{ color: "#EF4444" }}>{patient.tipoDiabetes}</strong>
        </div>
        <div style={row}>
          <span>Diagnóstico:</span> <strong>{patient.anioDiagnostico}</strong>
        </div>

        <div style={{ marginTop: "10px", padding: "10px", background: "#F3F4F6", borderRadius: "8px" }}>
          <p style={{ margin: "0 0 5px", fontSize: "13px", fontWeight: "600" }}>Antecedentes / Comorbilidades:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {patient.hipertension && <span style={tag}>Hipertensión</span>}
            {patient.hipotiroidismo && <span style={tag}>Hipotiroidismo</span>}
            {patient.dislipidemia && <span style={tag}>Dislipidemia</span>}
            {patient.renal && <span style={tag}>Enf. Renal</span>}
            {patient.antecedentesFamiliares && <span style={tag}>Ant. Familiares</span>}
            {!patient.hipertension && !patient.hipotiroidismo && !patient.dislipidemia && !patient.renal && <span style={{ fontSize: "13px", color: "#666" }}>Sin otros antecedentes reportados.</span>}
          </div>
        </div>
      </div>

      <div style={section}>
        <h4 style={sectionTitle}>Estilo de Vida</h4>
        <div style={row}>
          <span>Peso / Altura:</span> <strong>{patient.peso}kg / {patient.altura}cm</strong>
        </div>
        <div style={row}>
          <span>Actividad:</span> <strong>{patient.actividadFisica}</strong>
        </div>
        <div style={row}>
          <span>Fumador:</span> <strong>{patient.fumador ? "Sí 🚬" : "No"}</strong>
        </div>
      </div>

      <div style={section}>
        <h4 style={sectionTitle}>Contacto de Emergencia 🆘</h4>
        <div style={row}>
          <span>Nombre:</span> <strong>{patient.emergenciaNombre} ({patient.emergenciaRelacion})</strong>
        </div>
        <div style={row}>
          <span>Teléfono:</span>
          <a href={`tel:${patient.emergenciaTelefono}`} style={{ color: "#1F4FFF", fontWeight: "bold", textDecoration: "none" }}>
            {patient.emergenciaTelefono}
          </a>
        </div>
      </div>

      <button
        style={btn}
        onClick={() => alert("Función de editar en construcción")}
      >
        Editar Perfil
      </button>

      <button
        style={{ ...btn, background: "#EF4444", marginTop: "15px" }}
        onClick={handleDeleteAccount}
      >
        Eliminar Cuenta
      </button>

      {/* CALCULADORA IMC */}
      <BMICalculator />

      {/* RESUMEN DE SALUD / BIENESTAR */}
      <div style={{ marginTop: "30px" }}>
        <h3 style={{ fontSize: "20px", marginBottom: "15px" }}>Resumen de Bienestar 🌟</h3>

        {/* Próximas Medicinas */}
        <div style={section}>
          <h4 style={sectionTitle}>💊 Mis Medicamentos</h4>
          {(() => {
            if (medicines.length === 0) return <p style={{ color: "#666" }}>No hay medicamentos registrados.</p>;
            return medicines.slice(0, 2).map((m: any, i: number) => (
              <div key={i} style={row}>
                <span>{m.nombre}</span>
                <strong>{m.horario ? m.horario : (m.horarios && m.horarios[0]) || ""}</strong>
              </div>
            ));
          })()}
          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <a href="/medicines" style={{ fontSize: "14px", color: "#3B82F6" }}>Ver todos →</a>
          </div>
        </div>

        {/* Próxima Cita */}
        <div style={section}>
          <h4 style={sectionTitle}>📅 Próxima Visita Médica</h4>
          {(() => {
            if (appointments.length === 0) return <p style={{ color: "#666" }}>No hay citas agendadas.</p>;
            // Encontrar próxima
            const next = appointments.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
              .find((a: any) => new Date(`${a.fecha}T23:59`) >= new Date());

            if (!next) return <p style={{ color: "#666" }}>No tienes citas futuras.</p>;

            return (
              <div>
                <div style={row}>
                  <span>Dr. {next.doctor}</span>
                  <strong>{new Date(next.fecha).toLocaleDateString()}</strong>
                </div>
                <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#666" }}>{next.motivo}</p>
              </div>
            );
          })()}
          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <a href="/appointments" style={{ fontSize: "14px", color: "#3B82F6" }}>Gestionar citas →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  marginBottom: "20px",
};

const avatar: React.CSSProperties = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: "#1F4FFF",
  color: "white",
  fontSize: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  fontWeight: "bold",
};

const section: React.CSSProperties = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "15px",
  border: "1px solid #eee",
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 15px 0",
  fontSize: "16px",
  color: "#333",
  borderBottom: "1px solid #f0f0f0",
  paddingBottom: "8px",
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  fontSize: "15px",
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  background: "#3B82F6",
  color: "white",
  border: "none",
  fontSize: "18px",
  fontWeight: "bold",
  cursor: "pointer",
};

const tag: React.CSSProperties = {
  fontSize: "12px",
  background: "#DBEAFE",
  color: "#1E40AF",
  padding: "2px 8px",
  borderRadius: "20px",
  fontWeight: "500",
  border: "1px solid #93C5FD"
};
