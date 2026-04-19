import { useEffect, useState } from "react";
import { getSystemLogs, type SystemLog } from "../../services/adminService";

export default function AdminLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getSystemLogs(100);
      setLogs(data);
      setLoading(false);
    };
    load();
  }, []);

  const getTypeStyle = (type: SystemLog["type"]) => {
    const styles: Record<string, { bg: string; text: string; icon: string }> = {
      info: { bg: "#DBEAFE", text: "#1D4ED8", icon: "ℹ️" },
      warning: { bg: "#FEF3C7", text: "#D97706", icon: "⚠️" },
      error: { bg: "#FEE2E2", text: "#DC2626", icon: "❌" },
      action: { bg: "#D1FAE5", text: "#047857", icon: "✅" }
    };
    return styles[type] || styles.info;
  };

  const formatDate = (timestamp: { toDate: () => Date } | null) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate();
      return date.toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", margin: "0 0 10px 0" }}>Logs del Sistema</h2>
        <p style={{ color: "#6B7280", margin: 0 }}>Últimas {logs.length} acciones registradas</p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>Cargando logs...</div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
          No hay logs registrados aún
        </div>
      ) : (
        <div>
          {logs.map((log) => {
            const style = getTypeStyle(log.type);
            return (
              <div
                key={log.id}
                style={{
                  background: "white",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  border: "1px solid #E5E7EB",
                  borderLeft: `4px solid ${style.text}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px"
                }}
              >
                <span style={{ fontSize: "18px" }}>{style.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#111827" }}>{log.message}</p>
                  <div style={{ display: "flex", gap: "15px", marginTop: "6px", fontSize: "12px", color: "#6B7280" }}>
                    <span>{formatDate(log.timestamp as { toDate: () => Date })}</span>
                    {log.userName && <span>👤 {log.userName}</span>}
                  </div>
                </div>
                <span style={{
                  background: style.bg,
                  color: style.text,
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}>
                  {log.type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
