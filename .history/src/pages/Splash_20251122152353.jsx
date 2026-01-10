import { useEffect } from "react";

export default function Splash() {
  useEffect(() => {
    setTimeout(() => {
      window.location.href = "/welcome";
    }, 2000);
  }, []);

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      backgroundColor: "white"
    }}>
      <img src="/logo.png" alt="logo" style={{ width: 150, marginBottom: 20 }} />
      <p>wwww…</p>
    </div>
  );
}
