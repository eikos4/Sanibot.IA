export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        minHeight: "100dvh",
        backgroundColor: "#FFFFFF",
        padding: "20px",
      }}
    >
      <div
        style={{
       
        , // estilo app móvil centrada
        }}
      >
        {children}
      </div>
    </div>
  );
}
