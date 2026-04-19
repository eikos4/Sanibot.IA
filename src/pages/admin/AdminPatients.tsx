import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUsersByRole, type UserProfile } from "../../services/adminService";

export default function AdminPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getUsersByRole("patient");
      setPatients(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", margin: "0 0 10px 0" }}>Pacientes</h2>
        <p style={{ color: "#6B7280", margin: 0 }}>{patients.length} pacientes registrados</p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>Cargando pacientes...</div>
      ) : patients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>No hay pacientes registrados</div>
      ) : (
        <div>
          {patients.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/admin/patient/${p.id}`)}
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "12px",
                border: "1px solid #E5E7EB",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "16px" }}>{p.name || "Sin nombre"}</strong>
                  <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
                    {p.email || p.username}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  {p.tipoDiabetes && (
                    <span style={{
                      background: "#DBEAFE",
                      color: "#1D4ED8",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600
                    }}>
                      {p.tipoDiabetes}
                    </span>
                  )}
                  <p style={{ margin: "4px 0 0", color: "#9CA3AF", fontSize: "12px" }}>
                    {p.profileCompleted ? "✅ Perfil completo" : "⚠️ Perfil incompleto"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
