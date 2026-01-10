import { useState, useEffect } from "react";

export default function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevenir que el mini-infobar aparezca en móvil
            e.preventDefault();
            // Guardar el evento para dispararlo luego
            setDeferredPrompt(e);
            // Mostrar nuestro banner
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Mostrar el prompt nativo
        deferredPrompt.prompt();

        // Esperar a que el usuario responda
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        // Limpiar
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={bannerStyle}>
            <div style={contentStyle}>
                <span style={{ fontSize: "24px" }}>📲</span>
                <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>Prueba Sanibot en tu teléfono</div>
                    <div style={{ fontSize: "12px", opacity: 0.9 }}>Instala la app para mejor experiencia</div>
                </div>
            </div>
            <button style={buttonStyle} onClick={handleInstallClick}>
                Instalar
            </button>
            <button
                style={closeStyle}
                onClick={() => setIsVisible(false)}
                aria-label="Cerrar"
            >
                ✕
            </button>
        </div>
    );
}

const bannerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    background: "linear-gradient(90deg, #1F4FFF 0%, #3B82F6 100%)",
    color: "white",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 -4px 10px rgba(0,0,0,0.2)",
    zIndex: 9999,
    fontFamily: "Inter, system-ui, sans-serif",
};

const contentStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
};

const buttonStyle: React.CSSProperties = {
    background: "white",
    color: "#1F4FFF",
    border: "none",
    padding: "8px 20px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
};

const closeStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
    marginLeft: "10px",
    opacity: 0.7,
};
