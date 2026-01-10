export default function AdminUsers() {
  const users = [
    { name: "Admin Principal", role: "admin" },
    { name: "María González", role: "paciente" },
    { name: "Juan Pérez", role: "cuidador" },
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Usuarios Registrados</h2>

      <div style={{ marginTop: "20px" }}>
        {users.map((u, i) => (
          <div
            key={i}
            style={item}
            onClick={() => (window.location.href = "/admin/user/1")}
          >
            <p><strong>{u.name}</strong></p>
            <p style={{ color: "#666" }}>{u.role}</p>
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
  cursor: "pointer",
};
