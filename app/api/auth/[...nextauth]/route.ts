import NextAuth, { type NextAuthOptions, type DefaultSession, type User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

/* AuthOptions con tipado */
export const authOptions: NextAuthOptions = {
  providers: [
    /* Google */
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),

    /* Email + contraseña */
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;                 // guard-rail TS

        const body = new URLSearchParams({
          username: credentials.email,
          password: credentials.password,
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          { method: "POST", body },
        );
        if (!res.ok) return null;

        const data = await res.json();                 // { access_token, ... }

        /* Objeto que se inyecta en `user` de callbacks */
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

  /*  Literal cast para que TS no proteste */
  session: { strategy: "jwt" as const },

  callbacks: {
    /* ---------- TIPOS EXPLÍCITOS EN CADA CALLBACK ---------- */

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

    async jwt({
      token,
      user,
    }: {
      token: any;                  // JWT que NextAuth crea
      user?: User & { accessToken?: string };
    }) {
      /* desde CredentialsProvider */
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
      }

      /* desde GoogleProvider (puente FastAPI) */
      if (!token.accessToken && token.email && !user) {
        const body = new URLSearchParams({
          username: token.email as string,
          password: "oauth",
        });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          { method: "POST", body },
        ).then(r => r.json());

        token.accessToken = res.access_token;
        token.picture = res.picture;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: DefaultSession & { accessToken?: string };
      token: any;
    }) {
      session.accessToken = token.accessToken;
      if (token.picture && session.user) {
        session.user.image = token.picture;
      }
      return session;
    },

    redirect({ url, baseUrl }) {
      // 1.  misma origin
      if (url.startsWith(baseUrl)) return url;

      // 2.  ruta relativa → la anteponemos al dominio
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // 3.  lo demás al dashboard
      return `${baseUrl}/dashboard`;
    },
  },
};

/* Creamos el handler */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
