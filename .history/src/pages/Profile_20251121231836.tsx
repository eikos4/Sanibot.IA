export default function Profile() {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Mi Perfil</h2>

      <div
        style={{
          padding: "20px",
          background: "#F5F5F5",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <p>Nombre: ---</p>
        <p>RUT: ---</p>
        <p>Edad: ---</p>
        <p>Tipo de diabetes: ---</p>
      </div>

      <button
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: "12px",
          background: "#3B82F6",
          color: "white",
          border: "none",
          marginTop: "20px",
          fontSize: "18px",
        }}
      >
        Editar Perfil
      </button>
    </div>
  );
}
