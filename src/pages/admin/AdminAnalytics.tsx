import { useEffect, useState } from "react";
import { getAdminStats, type AdminStats } from "../../services/adminService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

interface DailyStats {
  date: string;
  glucoseReadings: number;
  alerts: number;
  newUsers: number;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [adminStats, daily] = await Promise.all([
      getAdminStats(),
      getDailyStats()
    ]);
    
    setStats(adminStats);
    setDailyStats(daily);
    setLoading(false);
  };

  const getDailyStats = async (): Promise<DailyStats[]> => {
    const days: DailyStats[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      try {
        // Count glucose readings for this day
        const glucoseRef = collection(db, "glucose_readings");
        const gq = query(glucoseRef, where("fecha", "==", dateStr));
        const glucoseSnap = await getDocs(gq);
        
        // Count alerts for this day
        const alertsRef = collection(db, "alerts");
        const aq = query(alertsRef, where("createdAt", ">=", new Date(dateStr)), where("createdAt", "<", new Date(date.getTime() + 86400000)));
        let alertCount = 0;
        try {
          const alertSnap = await getDocs(aq);
          alertCount = alertSnap.size;
        } catch {
          // Ignore if alerts collection doesn't exist
        }
        
        days.push({
          date: date.toLocaleDateString("es-CL", { weekday: "short", day: "numeric" }),
          glucoseReadings: glucoseSnap.size,
          alerts: alertCount,
          newUsers: 0
        });
      } catch {
        days.push({ date: dateStr, glucoseReadings: 0, alerts: 0, newUsers: 0 });
      }
    }
    
    return days;
  };

  const maxGlucose = Math.max(...dailyStats.map(d => d.glucoseReadings), 1);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px", color: "#6B7280" }}>Cargando analíticas...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "24px", margin: "0 0 10px 0" }}>Analítica General</h2>
        <p style={{ color: "#6B7280", margin: 0 }}>Estadísticas de la plataforma</p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <StatCard icon="👥" label="Usuarios" value={stats?.totalUsers || 0} color="#6366F1" />
        <StatCard icon="🧑‍⚕️" label="Pacientes" value={stats?.totalPatients || 0} color="#10B981" />
        <StatCard icon="🛡️" label="Cuidadores" value={stats?.totalCaretakers || 0} color="#F59E0B" />
        <StatCard icon="👑" label="Admins" value={stats?.totalAdmins || 0} color="#EF4444" />
      </div>

      {/* Activity Today */}
      <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#374151" }}>Actividad de Hoy</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          <div style={{ textAlign: "center", padding: "20px", background: "#F0FDF4", borderRadius: "12px" }}>
            <p style={{ margin: "0 0 5px 0", fontSize: "32px", fontWeight: 700, color: "#10B981" }}>
              {stats?.glucoseReadingsToday || 0}
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#6B7280" }}>Lecturas de Glucosa</p>
          </div>
          <div style={{ textAlign: "center", padding: "20px", background: "#FEF2F2", borderRadius: "12px" }}>
            <p style={{ margin: "0 0 5px 0", fontSize: "32px", fontWeight: 700, color: "#EF4444" }}>
              {stats?.alertsToday || 0}
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#6B7280" }}>Alertas Generadas</p>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#374151" }}>Lecturas de Glucosa - Últimos 7 días</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "150px" }}>
          {dailyStats.map((day, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div 
                style={{ 
                  width: "100%", 
                  background: "linear-gradient(180deg, #6366F1 0%, #8B5CF6 100%)",
                  borderRadius: "6px 6px 0 0",
                  height: `${Math.max((day.glucoseReadings / maxGlucose) * 120, 4)}px`,
                  transition: "height 0.3s ease"
                }} 
              />
              <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#6B7280", textAlign: "center" }}>{day.date}</p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", fontWeight: 600, color: "#374151" }}>{day.glucoseReadings}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px" }}>
        <div style={{ background: "#F5F3FF", borderRadius: "12px", padding: "20px" }}>
          <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#6B7280" }}>Total Lecturas (7 días)</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "#6366F1" }}>
            {dailyStats.reduce((sum, d) => sum + d.glucoseReadings, 0)}
          </p>
        </div>
        <div style={{ background: "#FEF3C7", borderRadius: "12px", padding: "20px" }}>
          <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#6B7280" }}>Promedio Diario</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "#D97706" }}>
            {Math.round(dailyStats.reduce((sum, d) => sum + d.glucoseReadings, 0) / 7)}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textAlign: "center" }}>
      <span style={{ fontSize: "28px" }}>{icon}</span>
      <p style={{ margin: "10px 0 5px", fontSize: "28px", fontWeight: 700, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>{label}</p>
    </div>
  );
}
