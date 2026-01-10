export default function CaretakerPatients() {
  const patients = [
    { name: "María González", diabetes: "Tipo 2" },
    { name: "Luis Pérez", diabetes: "Tipo 1" },
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Pacientes Asignados</h2>

      <div style={{ marginTop: "20px" }}>
        {patients.map((p, i) => (
          <div
            key={i}
            style={{
              background: "#F5F5F5",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "15px",
              textAlign: "left",
            }}
            onClick={() => (window.location.href = "/caretaker/patient/1")}
          >
            <p><strong>{p.name}</strong></p>
            <p style={{ color: "#666" }}>Diabetes: {p.diabetes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
