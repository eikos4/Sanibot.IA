import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { User } from "../services/authService";

export default function Maintenance() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const fetchedUsers: User[] = [];
            querySnapshot.forEach((doc) => {
                fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
            });
            setUsers(fetchedUsers);
            addLog(`Se encontraron ${fetchedUsers.length} usuarios.`);
        } catch (error: any) {
            addLog(`Error al cargar usuarios: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteOne = async (uid: string, email: string) => {
        if (!confirm(`¿Seguro que quieres borrar a ${email}? (Recuerda borrarlo también de Auth)`)) return;

        try {
            await deleteDoc(doc(db, "users", uid));
            addLog(`Documento Firestore eliminado para: ${email} (${uid})`);
            addLog(`⚠️ RECORDATORIO: Debes borrar manualmente el usuario ${email} en Firebase Console > Authentication.`);
            setUsers(prev => prev.filter(u => u.id !== uid));
        } catch (error: any) {
            addLog(`Error eliminando ${email}: ${error.message}`);
        }
    };

    const deleteAll = async () => {
        if (!confirm("¿ESTÁS SEGURO? Esto borrará TODOS los registros de usuarios de la base de datos local.")) return;

        setLoading(true);
        for (const user of users) {
            try {
                await deleteDoc(doc(db, "users", user.id));
                addLog(`Eliminado: ${user.username || user.id}`);
            } catch (e: any) {
                addLog(`Error con ${user.id}: ${e.message}`);
            }
        }
        setUsers([]);
        setLoading(false);
        addLog("✅ Todos los registros de Firestore han sido eliminados.");
        addLog("⚠️ IMPORTANTE: Ahora ve a Firebase Console y borra todos los usuarios en Authentication para permitir nuevos registros.");
    };

    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <h1 style={{ color: "#EF4444" }}>☢️ Zona de Limpieza Total</h1>
            <p style={{ color: "#666" }}>
                Aquí puedes ver y eliminar los datos de los usuarios registrados en la base de datos.
                <br />
                <strong>Nota:</strong> Esta herramienta solo borra los datos del perfil (Firestore).
                Para que un usuario pueda volver a registrarse con el mismo correo/RUT,
                <span style={{ color: "#EF4444", fontWeight: "bold" }}> DEBES eliminarlo también de la sección Authentication en Firebase Console.</span>
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button onClick={fetchUsers} style={btnSecondary} disabled={loading}>
                    {loading ? "Cargando..." : "🔄 Refrescar Lista"}
                </button>
                {users.length > 0 && (
                    <button onClick={deleteAll} style={btnDanger} disabled={loading}>
                        {loading ? "Eliminando..." : "🗑️ ELIMINAR TODOS"}
                    </button>
                )}
            </div>

            <div style={{ marginTop: "30px", background: "white", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#F3F4F6", textAlign: "left" }}>
                        <tr>
                            <th style={th}>Nombre</th>
                            <th style={th}>RUT / Username</th>
                            <th style={th}>Email (Firebase)</th>
                            <th style={th}>Rol</th>
                            <th style={th}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#999" }}>No hay usuarios registrados</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                                    <td style={td}>{user.name}</td>
                                    <td style={td}>{user.username}</td>
                                    {/* @ts-ignore */}
                                    <td style={td}>{user.email || user.username}</td>
                                    <td style={td}>{user.role}</td>
                                    <td style={td}>
                                        <button
                                            // @ts-ignore
                                            onClick={() => deleteOne(user.id, user.email || user.username)}
                                            style={btnSmall}
                                        >
                                            Borrar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: "30px", background: "#1F2937", color: "#10B981", padding: "20px", borderRadius: "12px", height: "200px", fontSize: "12px", overflowY: "auto", fontFamily: "monospace" }}>
                <p style={{ margin: "0 0 10px 0", color: "#9CA3AF", borderBottom: "1px solid #374151", paddingBottom: "5px" }}>Log del sistema:</p>
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <a href="/login" style={{ color: "#2563EB", textDecoration: "none" }}>← Volver al login</a>
            </div>
        </div>
    );
}

const th = { padding: "12px", fontSize: "14px", color: "#4B5563" };
const td = { padding: "12px", fontSize: "14px", color: "#1F2937" };
const btnSecondary = { padding: "10px 20px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "white", cursor: "pointer" };
const btnDanger = { padding: "10px 20px", borderRadius: "8px", border: "none", background: "#DC2626", color: "white", fontWeight: "bold", cursor: "pointer" };
const btnSmall = { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#EF4444", color: "white", fontSize: "12px", cursor: "pointer" };
