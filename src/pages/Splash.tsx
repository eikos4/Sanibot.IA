import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate("/welcome");
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
      <p>www.leucode.cl</p>
    </div>
  );
}
