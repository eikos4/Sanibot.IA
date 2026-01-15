

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px", gap: "8px" }}>
            {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;

                return (
                    <div
                        key={index}
                        style={{
                            width: isActive ? "32px" : "12px",
                            height: "12px",
                            borderRadius: "6px",
                            background: isActive ? "#1F4FFF" : isCompleted ? "#93C5FD" : "#E5E7EB",
                            transition: "all 0.3s ease"
                        }}
                    />
                );
            })}
        </div>
    );
}
