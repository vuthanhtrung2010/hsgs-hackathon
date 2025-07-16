"use server";

export interface SessionData {
  id: string;
  userAgent: string;
  ip: string; // Changed from clientIp to ip
  current: boolean;
  createdAt: string;
  expiresAt: string; // Added expiresAt property
}

// Server action to validate session
export async function validateUserSession(
  sessionToken: string,
): Promise<boolean> {
  try {
    const apiBase =
      process.env.API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT;
    if (!apiBase) {
      return false;
    }

    const response = await fetch(
      new URL("/client/users/me", apiBase).toString(),
      {
        headers: { Authorization: `Bearer ${sessionToken}` },
      },
    );

    return response.ok;
  } catch (error) {
    console.error("Session validation error:", error);
    return false;
  }
}

// Server action to get current session
export async function getCurrentSession(
  sessionToken: string,
): Promise<SessionData | null> {
  try {
    const apiBase =
      process.env.API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT;

    if (!apiBase) {
      throw new Error("API base URL is not defined");
    }

    const response = await fetch(
      new URL("/client/sessions/me", apiBase).toString(),
      {
        headers: { Authorization: `Bearer ${sessionToken}` },
      },
    );

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error fetching current session:", error);
    return null;
  }
}

// Server action to logout all sessions
export async function logoutAllSessions(
  sessionToken: string,
): Promise<boolean> {
  try {
    const apiBase =
      process.env.API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT;
    if (!apiBase) {
      throw new Error("API base URL is not defined");
    }

    const response = await fetch(
      new URL("/client/sessions/all", apiBase).toString(),
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      },
    );

    return response.ok;
  } catch (error) {
    console.error("Failed to logout all sessions:", error);
    return false;
  }
}

// Server action to get all active sessions
export async function getActiveSessions(
  sessionToken: string,
): Promise<SessionData[]> {
  try {
    const apiBase =
      process.env.API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT;
    if (!apiBase) {
      throw new Error("API base URL is not defined");
    }

    const response = await fetch(
      new URL("/client/sessions/all", apiBase).toString(),
      {
        headers: { Authorization: `Bearer ${sessionToken}` },
      },
    );

    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return [];
  }
}
