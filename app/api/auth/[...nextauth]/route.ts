import NextAuth, { type NextAuthOptions, type DefaultSession, type User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { publicApiFetch } from "@/lib/api/client";
/***********************************************************************************************************************/
/* Extend User type to include accessToken, refreshToken, and provider */
declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    plan?: string;
    analysis_count?: number;
  }
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      plan?: string;
      analysis_count?: number;
    } & DefaultSession["user"];
  }
}

/* Helper function to fetch Google avatar */
async function fetchGoogleAvatar(accessToken: string | undefined) {
  if (!accessToken) {
    console.log("No accessToken provided for fetchGoogleAvatar");
    return null;
  }

  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.log("Failed to fetch userinfo:", res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    console.log("Fetched userinfo:", data);
    return data.picture ?? null;
  } catch (error) {
    console.error("Error fetching Google avatar:", error);
    return null;
  }
}

/* Main configuration */
export const authOptions: NextAuthOptions = {
  providers: [
    /* Google Provider */
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          redirect_uri:
            process.env.NODE_ENV === "production"
              ? "https://app-ianalyticblood.vercel.app/api/auth/callback/google"
              : "http://localhost:3000/api/auth/callback/google",
        },
      },
    }),

    /* Credentials Provider */
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          body: new URLSearchParams({
            username: email,
            password: password,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        // Extraemos el alias de forma segura y capitalizamos
        const rawName = data.name || data.full_name || email.split("@")[0] || "Usuario";
        const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        return {
          id: email,
          email: email,
          name: displayName,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          provider: "credentials",
          plan: data.plan || "free",
          analysis_count: data.analysis_count || 0,
        } as User & {
          accessToken: string;
          refreshToken: string;
          provider: string;
          plan: string;
          analysis_count: number;
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET, // Se añade secret explícito para producción
  useSecureCookies: process.env.NODE_ENV === "production",

  /* Callbacks */
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }): Promise<boolean | string> {
      if (account?.provider === "google") {
        try {
          const envUrl = process.env.NEXT_PUBLIC_API_URL;
          let apiUrl = envUrl || "http://localhost:8000/api";

          if (!envUrl) {
            console.warn(
              "[AUTH DEBUG] ⚠️  AVISO: NEXT_PUBLIC_API_URL no está definido en el .env. Usando default: http://localhost:8000/api",
            );
          }

          // Resiliencia para el bug de DNS de Node.js 18+ en macOS
          // Si estamos en entorno servidor y la URL es localhost, la forzamos a 127.0.0.1
          if (typeof window === "undefined" && apiUrl.includes("localhost")) {
            apiUrl = apiUrl.replace("localhost", "127.0.0.1");
          }

          console.log(`[AUTH DEBUG] Intentando registro/login Google`);
          console.log(`[AUTH DEBUG] Backend URL configurada: ${apiUrl}`);
          console.log(`[AUTH DEBUG] Email: ${user.email}`);

          const res = await publicApiFetch<{
            access_token: string;
            refresh_token: string;
            plan?: string;
            analysis_count?: number; // Tipado del contador en Google Auth
          }>("/auth/google", {
            method: "POST",
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              picture: user.image,
              provider: "google",
            }),
            // Inyectamos la URL corregida para evitar el error de fetch failed
            headers: { "x-api-url-override": apiUrl },
          });

          if (res && res.access_token) {
            console.log(`[AUTH DEBUG] ✅ Autenticación exitosa con el backend`);
            user.accessToken = res.access_token;
            user.refreshToken = res.refresh_token;
            user.provider = "google";
            user.plan = res.plan || "free";
            user.analysis_count = res.analysis_count || 0; // Guardamos contador desde Google login
            return true;
          }

          console.error("[AUTH DEBUG] ❌ No se recibió access_token del backend");
          return false;
        } catch (error: any) {
          console.error("[AUTH DEBUG] ❌ Error crítico en el backend:", error.message);

          // Log PROFUNDO de la causa del fallo (Causa raíz: ECONNREFUSED, etc.)
          if (error.cause) {
            console.error("[AUTH DEBUG] 👉 Causa Técnica Detallada:", error.cause);
          }

          // Debug si el api no esta corriendo..
          if (error.message.includes("fetch failed")) {
            console.error("[AUTH DEBUG] 🚨 EL SERVIDOR DE PYTHON NO RESPONDE.");
            console.error(
              "[AUTH DEBUG] 👉 Asegúrate de haber ejecutado 'docker-compose up' y que puerto 8000 esté UP.",
            );
          }

          return false;
        }
      }
      return true;
    },

    async jwt({
      token,
      user,
      account,
      trigger,
      session,
    }: {
      token: any;
      user?: any;
      account?: any;
      trigger?: "signIn" | "signUp" | "update";
      session?: any;
    }) {
      // Soporte robusto para actualización de sesión en tiempo real (Plan, Name, Image, etc)
      if (trigger === "update" && session) {
        if (session.analysis_count !== undefined) {
          token.analysis_count = session.analysis_count;
        }
        if (session.user?.analysis_count !== undefined) {
          token.analysis_count = session.user.analysis_count;
        }
        if (session.plan) token.plan = session.plan;
        if (session.user?.plan) token.plan = session.user.plan;

        console.log("[AUTH DEBUG] ✅ JWT actualizado con éxito:", {
          plan: token.plan,
          count: token.analysis_count,
          trigger,
        });
      }

      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image ?? null;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.provider = user.provider;
        token.plan = user.plan;
        token.analysis_count = user.analysis_count; // Inicializar contador en el token
      }

      if (account?.provider === "google" && account.access_token) {
        console.log("Google account access_token:", account.access_token); // Log para depurar
        token.googleAccessToken = account.access_token as string;
      }

      // Intentamos obtener la imagen si no está presente
      if (!token.picture && token.googleAccessToken) {
        console.log(
          "Attempting to fetch Google avatar with access_token:",
          token.googleAccessToken,
        );
        const fetchedPicture = await fetchGoogleAvatar(token.googleAccessToken as string);
        if (fetchedPicture) {
          token.picture = fetchedPicture;
        }
      }

      // Log para verificar el estado de token.picture
      console.log("Token picture after fetch attempt:", token.picture);

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        ...session.user,
        name: token.name,
        email: token.email,
        image: token.picture ?? null,
        plan: token.plan as string | undefined,
        analysis_count: token.analysis_count as number | undefined, // Exponer contador a la sesión cliente
      };
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;

      // Log para depurar session.user.image
      console.log("Session user image:", session.user.image);

      return session as DefaultSession & { accessToken?: string; refreshToken?: string };
    },

    redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
