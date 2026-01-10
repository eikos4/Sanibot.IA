import { useEffect } from 'react';

export default function NotificationManager() {
    useEffect(() => {
        // Solicitar permiso al cargar la app (o mejor, tras una interacción del usuario, pero para este demo lo haremos al inicio o lazy)
        // Lo ideal es no molestar al inicio, pero el requerimiento es asegurar notificaciones.

        const requestPermission = async () => {
            if (!("Notification" in window)) {
                console.log("Este navegador no soporta notificaciones de escritorio");
                return;
            }

            if (Notification.permission === "default") {
                await Notification.requestPermission();
            }
        };

        requestPermission();

        // Simulación: Programar una notificación de prueba si el permiso está concedido
        const timer = setTimeout(() => {
            if (Notification.permission === "granted") {
                new Notification("GlucoBot 🤖", {
                    body: "Recuerda registrar tu nivel de glucosa después del almuerzo.",
                    icon: "/pwa-192.png", // Asegúrate de que este icono exista o usa uno genérico
                    tag: "glucose-reminder"
                });
            }
        }, 10000); // 10 segundos después de entrar

        return () => clearTimeout(timer);
    }, []);

    return null; // Este componente no renderiza nada visual, solo lógica
}
