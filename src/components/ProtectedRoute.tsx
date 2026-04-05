import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPatientDataByUid } from "../services/patientStorage";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ONBOARDING_ALLOWED_ROUTES = [
    "/onboarding",
    "/welcome-call",
    "/maintenance",
    "/test-calls"
];

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    const [profileCheckLoading, setProfileCheckLoading] = useState(false);
    const [verifiedProfileCompleted, setVerifiedProfileCompleted] = useState<boolean | null>(null);

    const localPatientData = (() => {
        try {
            const raw = localStorage.getItem("glucobot_patient_data");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const isProfileCompleted =
        user?.profileCompleted === true || localPatientData?.profileCompleted === true;

    useEffect(() => {
        if (isLoading || !user) return;
        let cancelled = false;

        setVerifiedProfileCompleted(null);

        // Only verify for patient routes when it looks incomplete and we're not on allowed onboarding routes.
        if (user.role !== "patient") return;
        if (isProfileCompleted) {
            setVerifiedProfileCompleted(true);
            return;
        }
        if (ONBOARDING_ALLOWED_ROUTES.includes(location.pathname)) return;

        setProfileCheckLoading(true);
        getPatientDataByUid(user.id)
            .then((data) => {
                if (cancelled) return;
                const completed = (data as { profileCompleted?: boolean } | null)?.profileCompleted === true;
                setVerifiedProfileCompleted(completed);
            })
            .catch(() => {
                if (cancelled) return;
                setVerifiedProfileCompleted(false);
            })
            .finally(() => {
                if (cancelled) return;
                setProfileCheckLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user, isLoading, isProfileCompleted, location.pathname]);

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Cargando sesión...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (profileCheckLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Verificando perfil...</div>;
    }

    const finalProfileCompleted = isProfileCompleted || verifiedProfileCompleted === true;

    if (user.role === "patient" && !finalProfileCompleted && !ONBOARDING_ALLOWED_ROUTES.includes(location.pathname)) {
        return <Navigate to="/onboarding" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/welcome" replace />; // or an unauthorized page
    }

    return <Outlet />;
}
