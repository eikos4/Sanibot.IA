import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Cargando sesión...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/welcome" replace />; // or an unauthorized page
    }

    return <Outlet />;
}
