import NextAuth, {
  type NextAuthOptions,
  type DefaultSession,
  type User,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

/* ───────── helper ───────── */
async function fetchGoogleAvatar(accessToken: string | undefined) {
  if (!accessToken) return null;

  try {
    const res = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();              // { picture: "https://..." }
    return data.picture ?? null;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────────
   CONFIGURACIÓN PRINCIPAL
   ──────────────────────────────────────────────────────────────── */
export const authOptions: NextAuthOptions = {
  providers: [
    /* ───────── Google ───────── */
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",        // pide foto
          redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/google",
        },
      },
    }),

    /* ───────── Email + contraseña ───────── */
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const body = new URLSearchParams({
          username: credentials.email,
          password: credentials.password,
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          { method: "POST", body }
        );
        if (!res.ok) return null;

        const data = await res.json(); // { access_token, ... }

        return {
          id: credentials.email,
          email: credentials.email,
          name: credentials.email,
          accessToken: data.access_token,
          provider: "credentials",
        } as User & { accessToken: string; provider: string };
      },
    }),
  ],

  /* Estrategia JWT */
  session: { strategy: "jwt" },
  /** 👇🏼 ESTO fuerza que, en producción, se escriba
   *  __Secure-next-auth.session-token */
  useSecureCookies: process.env.NODE_ENV === "production",

  /* ────────────────── CALLBACKS ────────────────── */
  callbacks: {
    /* ▒▒▒ signIn ▒▒▒  — puentea datos a tu FastAPI si viene de Google */
    async signIn({ user }: { user: User & { provider?: string } }) {
      if (user.provider === "google") {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            password: "oauth",
            picture: user.image,
            provider: "google",
          }),
        }).catch(() => { });
      }
      return true;
    },

    /** jwt: mete foto si falta */
    async jwt({ token, user, account }: { token: any; user?: User; account?: any }) {
      // 1. Primera vez (user existe)
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = (user as any).image ?? (user as any).picture ?? null;
      }

      // 2. Guarda el access_token de Google (solo sirve para userinfo)
      if (account?.provider === "google" && account.access_token) {
        token.googleAccessToken = account.access_token as string;
      }

      // 3. Si aún no hay foto: la pedimos a Google una sola vez
      if (!token.picture && token.googleAccessToken) {
        token.picture = await fetchGoogleAvatar(token.googleAccessToken);
      }

      return token;
    },

    /* ▒▒▒ session ▒▒▒  — lo que llega al cliente por useSession() */
    async session({ session, token }) {
      session.user = {
        ...session.user,
        name: token.name,
        email: token.email,
        image: token.picture ?? null,
      };
      session.accessToken = token.accessToken as string | undefined;
      return session as DefaultSession & { accessToken?: string };
    },

    /* ▒▒▒ redirect ▒▒▒  — mantén tu lógica */
    redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },

  // cookies: {
  //   sessionToken: {
  //     /* ❗  NextAuth usa este nombre por defecto, pero aquí 
  //      *    le fijamos un path para que el borrado coincida */
  //     name: "next-auth.session-token",
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",          // <── importante
  //     },
  //   },
  // },
};

/* ────────────────────────────────────────────────────────────────
   HANDLER
   ──────────────────────────────────────────────────────────────── */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
