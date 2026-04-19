import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { getAdminStats, type AdminStats } from "../../services/adminService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", color: "#111827", margin: "0 0 10px 0" }}>Panel de Administración</h2>
        <p style={{ color: "#6B7280", margin: 0 }}>
          Resumen general de la plataforma
        </p>
      </header>

      {/* KPI WIDGETS */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
          Cargando estadísticas...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          <KpiCard title="Usuarios Totales" value={stats?.totalUsers.toString() || "0"} icon="👥" />
          <KpiCard title="Pacientes" value={stats?.totalPatients.toString() || "0"} icon="🧑‍⚕️" />
          <KpiCard title="Alertas Hoy" value={stats?.alertsToday.toString() || "0"} icon="🚨" isAlert />
          <KpiCard title="Cuidadores" value={stats?.totalCaretakers.toString() || "0"} icon="🛡️" />
          <KpiCard title="Lecturas Glucosa Hoy" value={stats?.glucoseReadingsToday.toString() || "0"} icon="🩸" />
          <KpiCard title="Administradores" value={stats?.totalAdmins.toString() || "0"} icon="👑" />
        </div>
      )}

      <h3 style={{ fontSize: "20px", marginBottom: "20px", color: "#374151" }}>Accesos Directos</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "15px",
        }}
      >
        <MenuButton icon="👥" label="Usuarios" path="/admin/users" navigate={navigate} />
        <MenuButton icon="🧑‍⚕️" label="Pacientes" path="/admin/patients" navigate={navigate} />
        <MenuButton icon="👨‍👩‍👧‍👦" label="Cuidadores" path="/admin/caregivers" navigate={navigate} />
        <MenuButton icon="📊" label="Analítica" path="/admin/analytics" navigate={navigate} />
        <MenuButton icon="📝" label="Logs" path="/admin/logs" navigate={navigate} />
        <MenuButton icon="⚙️" label="Configuración" path="/admin/config" navigate={navigate} />
      </div>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  icon: string;
  isAlert?: boolean;
}

function KpiCard({ title, value, icon, isAlert }: KpiCardProps) {
  return (
    <Card style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
        <span style={{ 
          fontSize: "24px", 
          background: isAlert ? "#FEF2F2" : "#F3F4F6", 
          padding: "8px", 
          borderRadius: "10px" 
        }}>{icon}</span>
      </div>
      <div>
        <h4 style={{ margin: "0 0 5px 0", color: "#6B7280", fontSize: "14px", fontWeight: "normal" }}>{title}</h4>
        <span style={{ 
          fontSize: "28px", 
          fontWeight: "bold", 
          color: isAlert && parseInt(value) > 0 ? "#EF4444" : "#111827" 
        }}>{value}</span>
      </div>
    </Card>
  );
}

interface MenuButtonProps {
  icon: string;
  label: string;
  path: string;
  navigate: any;
}

function MenuButton({ icon, label, path, navigate }: MenuButtonProps) {
  return (
    <button
      style={btn}
      onClick={() => navigate(path)}
      onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      {label}
    </button>
  );
}


const btn = {
  width: "100%",
  padding: "15px",
  background: "white",
  border: "1px solid #E5E7EB",
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600",
  transition: "all 0.2s",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
};
