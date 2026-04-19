import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getPendingLinkRequests, 
  acceptLinkRequest, 
  rejectLinkRequest,
  type CaretakerPatientLink 
} from "../services/caretakerService";

interface LinkRequestWithCaretaker extends CaretakerPatientLink {
  caretakerName?: string;
}

export default function LinkRequestsWidget() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LinkRequestWithCaretaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && user.role === "patient") {
      loadRequests();
    } else {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  const loadRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await getPendingLinkRequests(user.id);
    setRequests(data as LinkRequestWithCaretaker[]);
    setLoading(false);
  };

  const handleAccept = async (linkId: string) => {
    if (!user?.id) return;
    const success = await acceptLinkRequest(linkId, user.id);
    if (success) {
      loadRequests();
    }
  };

  const handleReject = async (linkId: string) => {
    if (!user?.id) return;
    const success = await rejectLinkRequest(linkId, user.id);
    if (success) {
      loadRequests();
    }
  };

  // Don't show if not a patient or no requests
  if (user?.role !== "patient" || loading || requests.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: "#FEF3C7",
      border: "1px solid #F59E0B",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "20px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "20px" }}>🔗</span>
        <strong style={{ color: "#92400E" }}>Solicitudes de Vinculación</strong>
      </div>
      
      {requests.map((req) => (
        <div
          key={req.id}
          style={{
            background: "white",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {req.caretakerName || "Un cuidador"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6B7280" }}>
              Quiere monitorear tu salud
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleReject(req.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #D1D5DB",
                background: "white",
                color: "#374151",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Rechazar
            </button>
            <button
              onClick={() => handleAccept(req.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#10B981",
                color: "white",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
