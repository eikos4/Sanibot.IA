import BottomNav from "../components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#FFF",
        paddingBottom: "80px", // espacio para el bottom nav
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "20px",
        }}
      >
        {children}
      </div>

      <BottomNav />
    </div>
  );
}
