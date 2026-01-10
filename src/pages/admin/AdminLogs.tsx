export default function AdminLogs() {
  const logs = [
    "Usuario admin inició sesión",
    "Paciente María agregó glicemia",
    "Robot envió alerta al cuidador",
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Logs del Sistema</h2>

      <div style={{ marginTop: "20px" }}>
        {logs.map((l, i) => (
          <div key={i} style={item}>
            <p>{l}</p>
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
  textAlign: "left" as const,
};
