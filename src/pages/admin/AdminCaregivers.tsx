import { useEffect, useState } from "react";
import { getUsersByRole, type UserProfile } from "../../services/adminService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

interface CaretakerWithPatients extends UserProfile {
  patientCount: number;
}

export default function AdminCaregivers() {
  const [caregivers, setCaregivers] = useState<CaretakerWithPatients[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getUsersByRole("caretaker");
      
      // Get patient count for each caretaker
      const withCounts = await Promise.all(
        data.map(async (c) => {
          try {
            const linksRef = collection(db, "caretaker_links");
            const q = query(linksRef, where("caretakerId", "==", c.id), where("status", "==", "active"));
            const snap = await getDocs(q);
            return { ...c, patientCount: snap.size };
          } catch {
            return { ...c, patientCount: 0 };
          }
        })
      );
      
      setCaregivers(withCounts);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", margin: "0 0 10px 0" }}>Cuidadores</h2>
        <p style={{ color: "#6B7280", margin: 0 }}>{caregivers.length} cuidadores registrados</p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>Cargando cuidadores...</div>
      ) : caregivers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>No hay cuidadores registrados</div>
      ) : (
        <div>
          {caregivers.map((c) => (
            <div
              key={c.id}
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "12px",
                border: "1px solid #E5E7EB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <strong style={{ fontSize: "16px" }}>{c.name || "Sin nombre"}</strong>
                <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
                  {c.email || c.username}
                </p>
              </div>
              <div style={{
                background: "#D1FAE5",
                color: "#047857",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 600
              }}>
                {c.patientCount} paciente{c.patientCount !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
