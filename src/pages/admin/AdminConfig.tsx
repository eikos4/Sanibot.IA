export default function AdminConfig() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Configuración</h2>

      <button style={btn}>Cambiar Tema</button>
      <button style={btn}>Resetear Base de Datos</button>
      <button style={{ ...btn, background: "#FF4444" }}>Modo Desarrollador</button>
    </div>
  );
}

const btn = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "none",
  background: "#1F4FFF",
  color: "white",
  marginTop: "15px",
  fontSize: "18px",
};
