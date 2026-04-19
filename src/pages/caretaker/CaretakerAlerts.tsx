import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  getCaretakerAlerts, 
  markAlertAsRead, 
  markAllAlertsAsRead,
  subscribeToAlerts,
  type PatientAlert 
} from "../../services/caretakerService";

export default function CaretakerAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!user?.id) return;
    loadAlerts();
    const unsubscribe = subscribeToAlerts(user.id, () => loadAlerts());
    return () => unsubscribe();
  }, [user?.id, filter]);

  const loadAlerts = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await getCaretakerAlerts(user.id, filter === "unread");
    setAlerts(data);
    setLoading(false);
  };

  const handleMarkAsRead = async (alertId: string) => {
    await markAlertAsRead(alertId);
    loadAlerts();
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    await markAllAlertsAsRead(user.id);
    loadAlerts();
  };

  const getSeverityStyle = (severity: PatientAlert["severity"]) => {
    const styles: Record<string, { bg: string; border: string; icon: string }> = {
      critical: { bg: "#FEE2E2", border: "#DC2626", icon: "🚨" },
      high: { bg: "#FEF3C7", border: "#F59E0B", icon: "⚠️" },
      medium: { bg: "#DBEAFE", border: "#3B82F6", icon: "ℹ️" },
      low: { bg: "#D1FAE5", border: "#10B981", icon: "📋" }
    };
    return styles[severity] || styles.medium;
  };

  const formatDate = (timestamp: { toDate: () => Date } | null) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      if (diff < 60000) return "Hace un momento";
      if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
      if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
      return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontSize: "24px", margin: "0 0 5px 0" }}>Alertas</h2>
          <p style={{ color: "#6B7280", margin: 0 }}>{unreadCount > 0 ? `${unreadCount} sin leer` : "Todas leídas"}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "white", cursor: "pointer", fontSize: "14px" }}>
            Marcar todas como leídas
          </button>
        )}
      </header>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {(["all", "unread"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: "20px", border: "none", background: filter === f ? "#1F2937" : "#F3F4F6", color: filter === f ? "white" : "#374151", cursor: "pointer", fontWeight: 500 }}>
            {f === "all" ? "Todas" : "Sin leer"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>Cargando alertas...</div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#F9FAFB", borderRadius: "12px" }}>
          <p style={{ fontSize: "48px", margin: "0 0 15px 0" }}>✅</p>
          <h3 style={{ margin: "0 0 10px 0", color: "#374151" }}>Sin alertas</h3>
          <p style={{ color: "#6B7280", margin: 0 }}>{filter === "unread" ? "No tienes alertas sin leer" : "No hay alertas registradas"}</p>
        </div>
      ) : (
        <div>
          {alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div key={alert.id} style={{ background: alert.read ? "white" : style.bg, padding: "16px", borderRadius: "12px", marginBottom: "12px", border: "1px solid #E5E7EB", borderLeft: `4px solid ${style.border}`, opacity: alert.read ? 0.7 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "18px" }}>{style.icon}</span>
                      <strong style={{ fontSize: "15px" }}>{alert.title}</strong>
                    </div>
                    <p style={{ margin: "0 0 8px 0", color: "#374151", fontSize: "14px" }}>{alert.message}</p>
                    <div style={{ display: "flex", gap: "15px", fontSize: "12px", color: "#6B7280" }}>
                      <span>👤 {alert.patientName}</span>
                      <span>{formatDate(alert.createdAt as { toDate: () => Date })}</span>
                    </div>
                  </div>
                  {!alert.read && (
                    <button onClick={(e) => { e.stopPropagation(); handleMarkAsRead(alert.id); }} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#1F2937", color: "white", fontSize: "12px", cursor: "pointer" }}>
                      Leído
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
