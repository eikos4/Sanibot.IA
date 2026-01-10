export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px",
        overflowY: "auto",
        maxWidth: "450px",
        margin: "0 auto",
        backgroundColor: "#FFFFFF"
      }}
    >
      {children}
    </div>
  );
}
