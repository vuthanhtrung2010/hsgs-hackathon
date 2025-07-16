import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    sessionToken?: string;
    sessionExpires?: number;
    error?: string;
    user: {
      id: string;
      email: string;
      username: string;
      fullname: string;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string;
    fullname: string;
    sessionToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessionToken?: string;
    id: string;
    email: string;
    username: string;
    fullname: string;
    sessionExpires?: number;
    error?: string;
  }
}

// Decode JWT token to extract session data
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userAgent: { label: "User Agent", type: "text" },
        clientIp: { label: "Client IP", type: "text" },
        captchaToken: { label: "Captcha Token", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        // Extract real client IP from the NextAuth request
        const getClientIp = (request: {
          headers?: Record<string, string | string[]>;
          ip?: string;
          connection?: { remoteAddress?: string };
        }) => {
          // Check various headers that might contain the real client IP
          const headers = request.headers || {};

          // Cloudflare
          if (headers["cf-connecting-ip"]) {
            return headers["cf-connecting-ip"];
          }

          // Standard forwarded headers
          if (headers["x-forwarded-for"]) {
            const forwarded = headers["x-forwarded-for"];
            const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
            return ips.split(",")[0].trim();
          }

          // Other common headers
          if (headers["x-real-ip"]) {
            return headers["x-real-ip"];
          }

          if (headers["x-client-ip"]) {
            return headers["x-client-ip"];
          }

          if (headers["x-forwarded"]) {
            const forwarded = headers["x-forwarded"];
            const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
            return ips.split(",")[0].trim();
          }

          if (headers["forwarded-for"]) {
            const forwardedFor = headers["forwarded-for"];
            const ips = Array.isArray(forwardedFor)
              ? forwardedFor[0]
              : forwardedFor;
            return ips.split(",")[0].trim();
          }

          if (headers["forwarded"]) {
            const forwarded = Array.isArray(headers["forwarded"])
              ? headers["forwarded"][0]
              : headers["forwarded"];
            const match = forwarded.match(/for=([^;]+)/);
            if (match) return match[1];
          }

          // Fallback to connection remote address
          return request.ip || request.connection?.remoteAddress || "unknown";
        };

        const clientIp = getClientIp(req);

        try {
          // Get JWT session token from backend
          const sessionRes = await fetch(
            new URL("/client/sessions/", process.env.API_ENDPOINT).toString(),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
                userAgent: credentials.userAgent,
                clientIp: clientIp,
                captchaToken: credentials.captchaToken,
              }),
            },
          );

          if (!sessionRes.ok) {
            const errorBody = await sessionRes.json();
            if (errorBody.message === "INCORRECT_CREDENTIALS") {
              throw new Error("Incorrect email or password. Please try again.");
            }
            throw new Error(
              errorBody.message || "An authentication error occurred.",
            );
          }

          const sessionData = await sessionRes.json();
          const sessionToken = sessionData.data; // This is the JWT token

          if (!sessionToken) {
            throw new Error(
              "Authentication failed: No session token received.",
            );
          }

          // Decode the JWT to get session information
          const decodedSession = decodeJWT(sessionToken);
          if (!decodedSession) {
            throw new Error("Failed to decode session token.");
          }

          // Get user data from /client/users/me using the session token
          const userRes = await fetch(
            new URL("/client/users/me", process.env.API_ENDPOINT).toString(),
            {
              headers: { Authorization: `Bearer ${sessionToken}` },
            },
          );

          if (!userRes.ok) {
            throw new Error("Failed to fetch user data after login.");
          }
          const userData = await userRes.json();

          // Return user object with session token
          return {
            ...userData,
            sessionToken: sessionToken,
          };
        } catch (e) {
          if (e instanceof Error) {
            throw e;
          }
          throw new Error(
            "An unexpected error occurred during authentication.",
          );
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: store session token and user data
        if (user.sessionToken) {
          token.sessionToken = user.sessionToken;
          token.id = user.id;
          token.email = user.email;
          token.username = user.username;
          token.fullname = user.fullname;

          // Decode JWT to get expiry
          const decodedSession = decodeJWT(user.sessionToken);
          // Use expiresAt ISO string if present
          if (decodedSession && decodedSession.expiresAt) {
            token.sessionExpires = Date.parse(decodedSession.expiresAt);
          }
        }

        return token;
      }

      // For subsequent requests, check if session is still valid
      const now = Date.now();
      if (token.sessionExpires && now < token.sessionExpires) {
        return token; // Session is still valid
      }

      // Session has expired, force sign out by clearing token data
      return {
        id: token.id,
        email: token.email,
        username: token.username,
        fullname: token.fullname,
        error: "SessionExpired",
      };
    },

    async session({ session, token }) {
      if (!token || token.error === "SessionExpired") {
        session.error = "SessionExpired";
        return session;
      }

      session.sessionToken = token.sessionToken;
      session.sessionExpires = token.sessionExpires;
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.fullname = token.fullname;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Delete the session from the backend when signing out
      if (token?.sessionToken) {
        try {
          await fetch(
            new URL("/client/sessions/me", process.env.API_ENDPOINT).toString(),
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token.sessionToken}` },
            },
          );
        } catch (error) {
          console.error("Failed to delete session on backend:", error);
          // Don't throw error here as we still want to complete the logout
        }
      }
    },
  },
  pages: {
    signIn: "/accounts/login", // your custom login page
  },
};

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userAgent: { label: "User Agent", type: "text" },
        clientIp: { label: "Client IP", type: "text" },
        captchaToken: { label: "Captcha Token", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        // Extract real client IP from the NextAuth request
        const getClientIp = (request: {
          headers?: Record<string, string | string[]>;
          ip?: string;
          connection?: { remoteAddress?: string };
        }) => {
          // Check various headers that might contain the real client IP
          const headers = request.headers || {};

          // Cloudflare
          if (headers["cf-connecting-ip"]) {
            return headers["cf-connecting-ip"];
          }

          // Standard forwarded headers
          if (headers["x-forwarded-for"]) {
            const forwarded = headers["x-forwarded-for"];
            const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
            return ips.split(",")[0].trim();
          }

          // Other common headers
          if (headers["x-real-ip"]) {
            return headers["x-real-ip"];
          }

          if (headers["x-client-ip"]) {
            return headers["x-client-ip"];
          }

          if (headers["x-forwarded"]) {
            const forwarded = headers["x-forwarded"];
            const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
            return ips.split(",")[0].trim();
          }

          if (headers["forwarded-for"]) {
            const forwardedFor = headers["forwarded-for"];
            const ips = Array.isArray(forwardedFor)
              ? forwardedFor[0]
              : forwardedFor;
            return ips.split(",")[0].trim();
          }

          if (headers["forwarded"]) {
            const forwarded = Array.isArray(headers["forwarded"])
              ? headers["forwarded"][0]
              : headers["forwarded"];
            const match = forwarded.match(/for=([^;]+)/);
            if (match) return match[1];
          }

          // Fallback to connection remote address
          return request.ip || request.connection?.remoteAddress || "unknown";
        };

        const clientIp = getClientIp(req);

        try {
          // Get JWT session token from backend
          const sessionRes = await fetch(
            new URL("/client/sessions/", process.env.API_ENDPOINT).toString(),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
                userAgent: credentials.userAgent,
                clientIp: clientIp,
                captchaToken: credentials.captchaToken,
              }),
            },
          );

          if (!sessionRes.ok) {
            const errorBody = await sessionRes.json();
            if (errorBody.message === "INCORRECT_CREDENTIALS") {
              throw new Error("Incorrect email or password. Please try again.");
            }
            throw new Error(
              errorBody.message || "An authentication error occurred.",
            );
          }

          const sessionData = await sessionRes.json();
          const sessionToken = sessionData.data; // This is the JWT token

          if (!sessionToken) {
            throw new Error(
              "Authentication failed: No session token received.",
            );
          }

          // Decode the JWT to get session information
          const decodedSession = decodeJWT(sessionToken);
          if (!decodedSession) {
            throw new Error("Failed to decode session token.");
          }

          // Get user data from /client/users/me using the session token
          const userRes = await fetch(
            new URL("/client/users/me", process.env.API_ENDPOINT).toString(),
            {
              headers: { Authorization: `Bearer ${sessionToken}` },
            },
          );

          if (!userRes.ok) {
            throw new Error("Failed to fetch user data after login.");
          }
          const userData = await userRes.json();

          // Return user object with session token
          return {
            ...userData,
            sessionToken: sessionToken,
          };
        } catch (e) {
          if (e instanceof Error) {
            throw e;
          }
          throw new Error(
            "An unexpected error occurred during authentication.",
          );
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: store session token and user data
        if (user.sessionToken) {
          token.sessionToken = user.sessionToken;
          token.id = user.id;
          token.email = user.email;
          token.username = user.username;
          token.fullname = user.fullname;

          // Decode JWT to get expiry
          const decodedSession = decodeJWT(user.sessionToken);
          // Use expiresAt ISO string if present
          if (decodedSession && decodedSession.expiresAt) {
            token.sessionExpires = Date.parse(decodedSession.expiresAt);
          }
        }

        return token;
      }

      // For subsequent requests, check if session is still valid
      const now = Date.now();
      if (token.sessionExpires && now < token.sessionExpires) {
        return token; // Session is still valid
      }

      // Session has expired, force sign out by clearing token data
      return {
        id: token.id,
        email: token.email,
        username: token.username,
        fullname: token.fullname,
        error: "SessionExpired",
      };
    },

    async session({ session, token }) {
      if (!token || token.error === "SessionExpired") {
        session.error = "SessionExpired";
        return session;
      }

      session.sessionToken = token.sessionToken;
      session.sessionExpires = token.sessionExpires;
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.fullname = token.fullname;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Delete the session from the backend when signing out
      if (token?.sessionToken) {
        try {
          await fetch(
            new URL("/client/sessions/me", process.env.API_ENDPOINT).toString(),
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token.sessionToken}` },
            },
          );
        } catch (error) {
          console.error("Failed to delete session on backend:", error);
          // Don't throw error here as we still want to complete the logout
        }
      }
    },
  },
  pages: {
    signIn: "/accounts/login", // your custom login page
  },
});

export { handler as GET, handler as POST };
