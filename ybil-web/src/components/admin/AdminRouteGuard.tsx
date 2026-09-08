import React, { useState, useEffect } from "react";
import { useAuth, type AuthUser } from "../../context/AuthContext";
import { apiClient } from "../../api/client";

interface AdminRouteGuardProps {
  children: React.ReactNode;
  onUnauthorized: (message: string) => void;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  onUnauthorized,
}) => {
  const { user, refreshUser } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const checkAdminAccess = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        if (isCurrent) {
          setIsAllowed(false);
          setIsVerifying(false);
          onUnauthorized(
            "Access Denied: Please sign in with an Administrator account.",
          );
        }
        return;
      }

      const checkRole = (u: AuthUser | null | undefined): boolean => {
        if (!u) return false;
        const r = (u.role as string)?.toUpperCase();
        return (
          r === "ADMIN" ||
          r === "ROLE_ADMIN" ||
          (u as unknown as { roles?: string[] }).roles?.includes(
            "ROLE_ADMIN",
          ) === true
        );
      };

      // 1. Instant check against memory user
      if (checkRole(user)) {
        if (isCurrent) {
          setIsAllowed(true);
          setIsVerifying(false);
        }
        return;
      }

      // 2. Check localStorage user_data
      try {
        const stored = localStorage.getItem("user_data");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (checkRole(parsed)) {
            if (isCurrent) {
              setIsAllowed(true);
              setIsVerifying(false);
            }
            return;
          }
        }
      } catch {
        // Ignore JSON parsing issue
      }

      // 3. Query /api/auth/me to verify authoritative role with backend
      try {
        const profile = await apiClient<AuthUser>("/api/auth/me");
        if (checkRole(profile)) {
          if (refreshUser) {
            await refreshUser();
          }
          if (isCurrent) {
            setIsAllowed(true);
            setIsVerifying(false);
          }
          return;
        }
      } catch {
        // Server returned 401/403 or network failure
      }

      // 4. If all checks fail, user is unauthorized
      if (isCurrent) {
        setIsAllowed(false);
        setIsVerifying(false);
        onUnauthorized(
          "Access Denied: You do not have permission to view the Admin Dashboard.",
        );
      }
    };

    checkAdminAccess();

    return () => {
      isCurrent = false;
    };
  }, [user, onUnauthorized, refreshUser]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-200">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-cyan-400" />
        <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Verifying administrator permissions...
        </p>
      </div>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
};
