import { useState, useEffect } from "react";
// @ts-ignore
import { getPatientData } from "../services/patientStorage";
import { getAppointments } from "../services/appointmentStorage";
// @ts-ignore
import { getMedicines } from "../services/medicineStorage";
import BMICalculator from "../components/BMICalculator";

// Interfaces
interface PatientData {
  nombre: string;
  rut: string;
  edad: string;
  tipoDiabetes: string;
  tipoSangre: string;
  estadoCivil: string;
  emergenciaNombre: string;
  emergenciaTelefono: string;
}

export default function Profile() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
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
          <span>Edad:</span> <strong>{patient.edad} años</strong>
        </div>
        <div style={row}>
          <span>Estado Civil:</span> <strong>{patient.estadoCivil}</strong>
        </div>
      </div>

      <div style={section}>
        <h4 style={sectionTitle}>Ficha Clínica</h4>
        <div style={row}>
          <span>Diabetes:</span> <strong style={{ color: "#EF4444" }}>{patient.tipoDiabetes}</strong>
        </div>
        <div style={row}>
          <span>Tipo de Sangre:</span> <strong>{patient.tipoSangre}</strong>
        </div>
      </div>

      <div style={section}>
        <h4 style={sectionTitle}>Contacto de Emergencia 🆘</h4>
        <div style={row}>
          <span>Nombre:</span> <strong>{patient.emergenciaNombre}</strong>
        </div>
        <div style={row}>
          <span>Teléfono:</span> <a href={`tel:${patient.emergenciaTelefono}`} style={{ color: "#1F4FFF" }}>Calling...</a>
          {/* Simulación visual del link */}
          <strong style={{ color: "#1F4FFF" }}>{patient.emergenciaTelefono}</strong>
        </div>
      </div>

      <button
        style={btn}
        onClick={() => alert("Función de editar en construcción")}
      >
        Editar Perfil
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
