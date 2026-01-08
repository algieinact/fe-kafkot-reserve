import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles: ("admin" | "super_admin" | "staff")[];
}

/**
 * RoleBasedRoute component
 * Protects routes based on user role
 * Redirects to appropriate page if user doesn't have required role
 */
export default function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
    const { user } = useAuth();
    const location = useLocation();

    // Check if user has required role
    if (user && !allowedRoles.includes(user.role)) {
        // Staff trying to access admin-only pages -> redirect to reservations
        if (user.role === "staff") {
            return <Navigate to="/dashboard/reservations" replace state={{ from: location }} />;
        }
        // Other unauthorized access -> redirect to home
        return <Navigate to="/" replace />;
    }

    // Render children if user has required role
    return <>{children}</>;
}
