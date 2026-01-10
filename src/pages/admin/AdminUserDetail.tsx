export default function AdminUserDetail() {
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Detalles del Usuario</h2>

      <div style={box}>
        <p><strong>Nombre:</strong> Juan Pérez</p>
        <p><strong>Rol:</strong> Cuidador</p>
        <p><strong>Email:</strong> juan@example.com</p>
      </div>

      <button style={btn}>Eliminar Usuario</button>
      <button style={{ ...btn, background: "#10B981" }}>Editar Usuario</button>
    </div>
  );
}

const box = {
  background: "#F5F5F5",
  padding: "20px",
  borderRadius: "10px",
  marginTop: "20px",
};

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
