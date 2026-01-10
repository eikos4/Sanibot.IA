export default function AdminPatients() {
  const patients = [
    { name: "María González", diabetes: "Tipo 2" },
    { name: "Luis Ramos", diabetes: "Tipo 1" },
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Pacientes</h2>

      <div style={{ marginTop: "20px" }}>
        {patients.map((p, i) => (
          <div
            key={i}
            style={item}
            onClick={() => (window.location.href = "/admin/patient/1")}
          >
            <p><strong>{p.name}</strong></p>
            <p style={{ color: "#666" }}>Diabetes: {p.diabetes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const item = {
  background: "#F5F5F5",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "15px",
  cursor: "pointer",
};
