import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    { id: 1, name: "Admin Principal", role: "admin", email: "admin@glucobot.cl" },
    { id: 2, name: "María González", role: "paciente", email: "maria@gmail.com" },
    { id: 3, name: "Juan Pérez", role: "cuidador", email: "juan@cuidador.cl" },
    { id: 4, name: "Roberto Díaz", role: "paciente", email: "roberto@gmail.com" },
    { id: 5, name: "Ana Silva", role: "paciente", email: "ana@gmail.com" },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>Usuarios Registrados</h2>

      <div style={{ maxWidth: "500px", margin: "0 auto 30px" }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #D1D5DB",
            fontSize: "16px"
          }}
        />
      </div>

      <div style={{ marginTop: "20px", display: "grid", gap: "10px" }}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              style={item}
              onClick={() => navigate(`/admin/user/${u.id}`)}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#E5E7EB"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#F5F5F5"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 5px 0", fontSize: "16px" }}><strong>{u.name}</strong></p>
                  <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>{u.email}</p>
                </div>
                <span style={{
                  background: u.role === "admin" ? "#DBEAFE" : u.role === "paciente" ? "#D1FAE5" : "#FEF3C7",
                  color: u.role === "admin" ? "#1E40AF" : u.role === "paciente" ? "#065F46" : "#92400E",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {u.role.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#9CA3AF" }}>No se encontraron usuarios.</p>
        )}
      </div>
    </div>
  );
}

const item = {
  background: "#F5F5F5",
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "0",
  textAlign: "left" as const,
  cursor: "pointer",
  transition: "background-color 0.2s"
};
