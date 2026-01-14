import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "../AuthPages/AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { Skeleton } from "../../components/ui/skeleton";

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
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="w-full max-w-sm space-y-8 rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
                    <div className="text-center space-y-2">
                        <Skeleton className="h-10 w-10 mx-auto rounded-full" />
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-4 w-64 mx-auto" />
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
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

