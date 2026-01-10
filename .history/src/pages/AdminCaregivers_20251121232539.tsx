export default function AdminCaregivers() {
  const caregivers = [
    { name: "Juan Pérez", pacientes: 2 },
    { name: "Esteban Muñoz", pacientes: 1 },
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Cuidadores</h2>

      <div style={{ marginTop: "20px" }}>
        {caregivers.map((c, i) => (
          <div key={i} style={item}>
            <p><strong>{c.name}</strong></p>
            <p style={{ color: "#666" }}>Pacientes: {c.pacientes}</p>
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
};
