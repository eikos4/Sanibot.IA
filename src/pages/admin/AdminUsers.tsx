import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole, type UserProfile } from "../../services/adminService";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "patient" | "caretaker" | "admin">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: "patient" | "caretaker" | "admin") => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      loadUsers();
    }
  };

  const filteredUsers = users
    .filter(u => filter === "all" || u.role === filter)
    .filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getRoleBadge = (role: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      patient: { bg: "#DBEAFE", text: "#1D4ED8" },
      caretaker: { bg: "#D1FAE5", text: "#047857" },
      admin: { bg: "#FEE2E2", text: "#DC2626" }
    };
    const labels: Record<string, string> = {
      patient: "Paciente",
      caretaker: "Cuidador",
      admin: "Admin"
    };
    const style = colors[role] || { bg: "#F3F4F6", text: "#374151" };
    return (
      <span style={{
        background: style.bg,
        color: style.text,
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600
      }}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", margin: "0 0 10px 0" }}>Gestión de Usuarios</h2>
        <p style={{ color: "#6B7280", margin: 0 }}>{users.length} usuarios registrados</p>
      </header>

      <input
        type="text"
        placeholder="🔍 Buscar por nombre o email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid #D1D5DB",
          fontSize: "16px",
          marginBottom: "15px",
          boxSizing: "border-box"
        }}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {(["all", "patient", "caretaker", "admin"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: filter === f ? "#1F2937" : "#F3F4F6",
              color: filter === f ? "white" : "#374151",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            {f === "all" ? "Todos" : f === "patient" ? "Pacientes" : f === "caretaker" ? "Cuidadores" : "Admins"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>Cargando usuarios...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>No hay usuarios</div>
      ) : (
        <div>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "12px",
                border: "1px solid #E5E7EB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <strong>{user.name || "Sin nombre"}</strong>
                  {getRoleBadge(user.role)}
                </div>
                <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>{user.email || user.username}</p>
              </div>
              
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as "patient" | "caretaker" | "admin")}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #D1D5DB",
                    background: "white",
                    cursor: "pointer"
                  }}
                >
                  <option value="patient">Paciente</option>
                  <option value="caretaker">Cuidador</option>
                  <option value="admin">Admin</option>
                </select>
                
                <button
                  onClick={() => navigate(`/admin/user/${user.id}`)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#1F2937",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
