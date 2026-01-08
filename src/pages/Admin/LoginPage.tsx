import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "../AuthPages/AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function LoginPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect to reservations if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate("/dashboard/reservations", { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat...</p>
                </div>
            </div>
        );
    }

    // Don't render login form if already authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    return (
        <>
            <PageMeta
                title="Login | Reservasi Ruang Dugamasa - Restaurant Reservation System"
                description="Login untuk mengakses dashboard dan mengelola reservasi, menu, dan meja restoran"
            />
            <AuthLayout>
                <SignInForm isAdminMode={true} />
            </AuthLayout>
        </>
    );
}

