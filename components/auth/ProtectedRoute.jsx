"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

export default function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    loading,
    user,
    loginRedirect,
    initializing,
    hasAccounts,
    authError,
    clearAuthError,
  } = useAuth();
  const { inProgress } = useMsal();
  const router = useRouter();
  const redirectingRef = useRef(false);

  const loginInProgress =
    inProgress && inProgress !== InteractionStatus.None;

  const startRedirect = useCallback(() => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    loginRedirect();
  }, [loginRedirect]);

  useEffect(() => {
    if (
      initializing ||
      loading ||
      loginInProgress ||
      authError
    ) {
      return;
    }

    const needsAuth = !isAuthenticated && !user && !hasAccounts;
    if (!needsAuth) return;

    startRedirect();
  }, [
    initializing,
    loading,
    loginInProgress,
    authError,
    isAuthenticated,
    user,
    hasAccounts,
    startRedirect,
  ]);

  useEffect(() => {
    if (authError || (isAuthenticated && user)) {
      redirectingRef.current = false;
    }
  }, [authError, isAuthenticated, user]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.prefetch("/");
    }
  }, [router, loading, isAuthenticated]);

  const handleRetry = () => {
    redirectingRef.current = false;
    clearAuthError();
    startRedirect();
  };

  const showLoading =
    !authError &&
    (initializing || loading || (hasAccounts && (!isAuthenticated || !user)));

  if (showLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p>Checking your Microsoft sign-in…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center text-gray-600">
        {authError ? (
          <>
            <p className="text-base font-medium text-red-600">
              Unable to sign you in.
            </p>
            <p className="text-sm text-gray-500 max-w-md">{authError}</p>
            <button
              onClick={handleRetry}
              className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
            >
              Try Microsoft sign-in again
            </button>
          </>
        ) : (
          <p>Redirecting to Microsoft sign-in…</p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
