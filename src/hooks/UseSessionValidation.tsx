"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useCallback } from "react";
import {
  validateUserSession,
  getCurrentSession,
  logoutAllSessions as serverLogoutAllSessions,
  getActiveSessions as serverGetActiveSessions,
} from "@/lib/server-actions/sessions";

export function useSessionValidation() {
  const { data: session, status } = useSession();

  const validateSession = useCallback(async () => {
    // Only validate if we have a session and session token
    if (status !== "authenticated" || !session?.sessionToken) {
      return false;
    }

    // Check if there's a session expired error
    if ("error" in session && session.error === "SessionExpired") {
      return false;
    }

    try {
      const isValid = await validateUserSession(session.sessionToken);

      // If the session is invalid, sign out
      if (!isValid) {
        await signOut({ callbackUrl: "/accounts/login" });
        return false;
      }

      return true;
    } catch {
      // On network errors, we might want to keep the session
      // but log the error for debugging
      return true;
    }
  }, [session, status]);

  const logout = useCallback(async () => {
    // For manual logout, we want to delete the session on the backend
    // The NextAuth signOut event handler will handle the DELETE call
    await signOut({ callbackUrl: "/accounts/login" });
  }, []);

  const logoutAllSessions = useCallback(async () => {
    // Logout from all sessions
    if (session?.sessionToken) {
      try {
        await serverLogoutAllSessions(session.sessionToken);
      } catch (error) {
        console.error("Failed to logout all sessions:", error);
      }
    }
    await signOut({ callbackUrl: "/accounts/login" });
  }, [session]);

  const getCurrentSessionData = useCallback(async () => {
    if (!session?.sessionToken) {
      return null;
    }

    try {
      return await getCurrentSession(session.sessionToken);
    } catch (error) {
      console.error("Error fetching current session:", error);
      return null;
    }
  }, [session]);

  const getActiveSessionsData = useCallback(async () => {
    if (!session?.sessionToken) {
      return [];
    }

    try {
      return await serverGetActiveSessions(session.sessionToken);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
      return [];
    }
  }, [session]);

  return {
    validateSession,
    logout,
    logoutAllSessions,
    getCurrentSession: getCurrentSessionData,
    getActiveSessions: getActiveSessionsData,
    isAuthenticated: status === "authenticated" && !!session?.sessionToken,
  };
}

export function usePeriodicSessionValidation(intervalMs: number = 60000) {
  const { validateSession } = useSessionValidation();

  useEffect(() => {
    // Set up periodic validation
    const interval = setInterval(validateSession, intervalMs);

    // Delay the first validation to avoid conflicts with initial load
    const timer = setTimeout(() => {
      validateSession();
    }, 5000); // Wait 5 seconds before first validation

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [validateSession, intervalMs]);
}
