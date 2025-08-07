"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers";
import FallbackScreen from "../ui/fallback-screen";
import { placeholder } from "@/resources/images";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = (
    <FallbackScreen
      image={placeholder}
      imageAlt="Loading"
      title="Loading..."
      subtitle="Please wait while we fetch your data..."
    />
  ),
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Show no user fallback if authenticated but no user data
  if (isAuthenticated && !user) {
    return (
      <FallbackScreen
        image={placeholder}
        imageAlt="No User"
        title="No User Data"
        subtitle="Unable to load user information. Please try refreshing the page or contact support."
      />
    );
  }

  // Show children only if authenticated and has user data
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};

export default AuthGuard;
