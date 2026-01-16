import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Cargando sesión...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const onboardingAllowedRoutes = [
        "/onboarding",
        "/welcome-call",
        "/maintenance",
        "/test-calls"
    ];

    const localPatientData = (() => {
        try {
            const raw = localStorage.getItem("glucobot_patient_data");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const isProfileCompleted =
        user.profileCompleted === true || localPatientData?.profileCompleted === true;

    if (user.role === "patient" && !isProfileCompleted && !onboardingAllowedRoutes.includes(location.pathname)) {
        return <Navigate to="/onboarding" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/welcome" replace />; // or an unauthorized page
    }

    return <Outlet />;
}
