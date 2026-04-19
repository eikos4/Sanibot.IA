import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUserRole, deleteUserData, type UserProfile } from "../../services/adminService";

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) loadUser();
  }, [id]);

  const loadUser = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getUserById(id);
    setUser(data);
    setLoading(false);
  };

  const handleRoleChange = async (newRole: "patient" | "caretaker" | "admin") => {
    if (!id) return;
    setSaving(true);
    const success = await updateUserRole(id, newRole);
    if (success) {
      loadUser();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    setSaving(true);
    const success = await deleteUserData(id);
    if (success) {
      navigate("/admin/users");
    } else {
      alert("Error al eliminar usuario");
    }
    setSaving(false);
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      patient: { bg: "#DBEAFE", text: "#1D4ED8" },
      caretaker: { bg: "#D1FAE5", text: "#047857" },
      admin: { bg: "#FEE2E2", text: "#DC2626" }
    };
    const labels: Record<string, string> = { patient: "Paciente", caretaker: "Cuidador", admin: "Admin" };
    const style = styles[role] || { bg: "#F3F4F6", text: "#374151" };
    return (
      <span style={{ background: style.bg, color: style.text, padding: "6px 14px", borderRadius: "20px", fontSize: "14px", fontWeight: 600 }}>
        {labels[role] || role}
      </span>
    );
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px", color: "#6B7280" }}>Cargando usuario...</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ fontSize: "48px", margin: "0 0 15px 0" }}>❌</p>
        <h3 style={{ color: "#374151" }}>Usuario no encontrado</h3>
        <button onClick={() => navigate("/admin/users")} style={{ ...btnStyle, marginTop: "20px", background: "#6B7280" }}>
          Volver a Usuarios
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <button onClick={() => navigate("/admin/users")} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", marginBottom: "20px", display: "flex", alignItems: "center", gap: "5px" }}>
        ← Volver a Usuarios
      </button>

      <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>{user.name || "Sin nombre"}</h2>
            <p style={{ margin: 0, color: "#6B7280" }}>{user.email || user.username}</p>
          </div>
          {getRoleBadge(user.role)}
        </div>

        <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "20px" }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#374151" }}>Información</h4>
          
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={infoRow}>
              <span style={infoLabel}>ID:</span>
              <span style={infoValue}>{user.id}</span>
            </div>
            <div style={infoRow}>
              <span style={infoLabel}>Username:</span>
              <span style={infoValue}>{user.username || "-"}</span>
            </div>
            <div style={infoRow}>
              <span style={infoLabel}>Email:</span>
              <span style={infoValue}>{user.email || "-"}</span>
            </div>
            <div style={infoRow}>
              <span style={infoLabel}>Perfil completo:</span>
              <span style={infoValue}>{user.profileCompleted ? "✅ Sí" : "❌ No"}</span>
            </div>
            {user.tipoDiabetes && (
              <div style={infoRow}>
                <span style={infoLabel}>Tipo Diabetes:</span>
                <span style={infoValue}>{user.tipoDiabetes}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "20px", marginTop: "20px" }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#374151" }}>Cambiar Rol</h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {(["patient", "caretaker", "admin"] as const).map(role => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                disabled={saving || user.role === role}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: user.role === role ? "2px solid #1F2937" : "1px solid #D1D5DB",
                  background: user.role === role ? "#1F2937" : "white",
                  color: user.role === role ? "white" : "#374151",
                  cursor: user.role === role ? "default" : "pointer",
                  fontWeight: 500,
                  opacity: saving ? 0.5 : 1
                }}
              >
                {role === "patient" ? "Paciente" : role === "caretaker" ? "Cuidador" : "Admin"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "20px", marginTop: "20px" }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#DC2626" }}>Zona de Peligro</h4>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} style={{ ...btnStyle, background: "#FEE2E2", color: "#DC2626" }}>
              🗑️ Eliminar Usuario
            </button>
          ) : (
            <div style={{ background: "#FEF2F2", padding: "16px", borderRadius: "12px" }}>
              <p style={{ margin: "0 0 15px 0", color: "#991B1B" }}>
                ¿Estás seguro? Esta acción eliminará todos los datos del usuario y no se puede deshacer.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ ...btnStyle, background: "#6B7280", flex: 1 }}>
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={saving} style={{ ...btnStyle, background: "#DC2626", flex: 1 }}>
                  {saving ? "Eliminando..." : "Sí, Eliminar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const infoRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: "8px 0" };
const infoLabel: React.CSSProperties = { color: "#6B7280", fontSize: "14px" };
const infoValue: React.CSSProperties = { fontWeight: 500, fontSize: "14px", textAlign: "right", wordBreak: "break-all" };
const btnStyle: React.CSSProperties = { width: "100%", padding: "14px", borderRadius: "12px", border: "none", color: "white", fontSize: "16px", fontWeight: 600, cursor: "pointer" };
