import { useEffect, useRef } from "react";

interface NeuralBackgroundProps {
    opacity?: number;
}

export default function NeuralBackground({ opacity = 1 }: NeuralBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Ajustar tamaño
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Crear nodos
        const nodes: any[] = [];
        const count = 30;

        for (let i = 0; i < count; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
            });
        }

        let animationFrameId: number;

        // Animación
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Mover nodos
            nodes.forEach((n) => {
                n.x += n.vx;
                n.y += n.vy;

                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(31,79,255,${0.9 * opacity})`; // Opacity applied here
                ctx.fill();
            });

            // Dibujar conexiones
            for (let i = 0; i < count; i++) {
                for (let j = i + 1; j < count; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 160) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(31,79,255,${(1 - dist / 160) * opacity})`; // Opacity applied here
                        ctx.lineWidth = 1;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Limpieza
        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [opacity]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
                pointerEvents: "none" // Important so it doesn't block clicks
            }}
        ></canvas>
    );
}
