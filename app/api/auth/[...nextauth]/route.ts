import NextAuth, { type NextAuthOptions, type DefaultSession, type User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { publicApiFetch } from "@/lib/api/client";
/***********************************************************************************************************************/
/* Extend User type to include accessToken, refreshToken, provider, role */
declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    plan?: string;
    analysis_count?: number;
    // Campo role para control de acceso al panel de admin
    role?: "user" | "admin";
  }
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      plan?: string;
      analysis_count?: number;
      // Role expuesto en la sesión de cliente para condicionar UI
      role?: "user" | "admin";
    } & DefaultSession["user"];
  }
}

/* Helper function to fetch Google avatar */
async function fetchGoogleAvatar(accessToken: string | undefined) {
  if (!accessToken) {
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
    return data.picture ?? null;
  } catch (error) {
    console.error("Error fetching Google avatar:", error);
    return null;
  }
}

/* Main configuration */
const authOptions: NextAuthOptions = {
  providers: [
    /* Google Provider */
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
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
          // Guardamos el rol devuelto por el backend en el token JWT
          role: (data.role as "user" | "admin") || "user",
        } as User & {
          accessToken: string;
          refreshToken: string;
          provider: string;
          plan: string;
          analysis_count: number;
          role: "user" | "admin";
        };
      },
    }),
  ],

  // MaxAge de 30 días — la sesión no expira tras unas pocas horas.
  // El JWT de NextAuth dura 30 días; el token del backend se renueva con refreshToken.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },

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

          // Logs de debug reducidos
          if (process.env.NODE_ENV !== "production") {
            console.log(`[AUTH DEBUG] Intentando registro/login Google`);
            console.log(`[AUTH DEBUG] Backend URL configurada: ${apiUrl}`);
          }

          const res = await publicApiFetch<{
            access_token: string;
            refresh_token: string;
            plan?: string;
            analysis_count?: number;
            // Role incluido en la respuesta del backend de Google — necesario para el admin panel
            role?: "user" | "admin";
          }>("/auth/google", {
            method: "POST",
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              picture: user.image,
              provider: "google",
            }),
            headers: { "x-api-url-override": apiUrl },
          });

          if (res && res.access_token) {
            if (process.env.NODE_ENV !== "production") {
              console.log(`[AUTH DEBUG] ✅ Autenticación Google exitosa`);
            }
            user.accessToken = res.access_token;
            user.refreshToken = res.refresh_token;
            user.provider = "google";
            user.plan = res.plan || "free";
            user.analysis_count = res.analysis_count || 0;
            // Role guardado desde Google login — el backend ya lo devuelve en _make_tokens
            user.role = res.role || "user";
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
      }

      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image ?? null;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.provider = user.provider;
        token.plan = user.plan;
        token.analysis_count = user.analysis_count;
        // Rol guardado en el JWT — fuente de verdad para AuthZ en el frontend
        token.role = user.role || "user";
      }

      if (account?.provider === "google" && account.access_token) {
        token.googleAccessToken = account.access_token as string;
      }

      // Solo intentar fetch de avatar una vez — si ya se intentó, no repetir
      if (!token.picture && token.googleAccessToken && !token._avatarFetched) {
        const fetchedPicture = await fetchGoogleAvatar(token.googleAccessToken as string);
        if (fetchedPicture) {
          token.picture = fetchedPicture;
        }
        token._avatarFetched = true; // Evitar llamadas repetidas a googleapis en cada request
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        ...session.user,
        name: token.name,
        email: token.email,
        image: token.picture ?? null,
        plan: token.plan as string | undefined,
        analysis_count: token.analysis_count as number | undefined,
        // Role expuesto en sesión de cliente para renderizado condicional de UI admin
        role: (token.role as "user" | "admin") ?? "user",
      };
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;

      return session as DefaultSession & {
        accessToken?: string;
        refreshToken?: string;
      };
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
