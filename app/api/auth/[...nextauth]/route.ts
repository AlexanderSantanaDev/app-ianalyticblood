import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },

  /* Bridge NextAuth → tu API */
  callbacks: {
    /** Se llama tras log-in en Google */
    async signIn({ user }) {
      // 1) Intenta crear el usuario en FastAPI (si ya existe devolverá 400 y lo ignoramos)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          password: "oauth",       // dummy
          picture: user.image,
          provider: "google",
        }),
      }).catch(() => { });
      return true;
    },

    /** Tras signIn generamos un JWT de tu backend y lo guardamos en el token de NextAuth */
    async jwt({ token }) {
      if (!token.accessToken && token.email) {
        const body = new URLSearchParams({
          username: token.email as string,
          password: "oauth",
        });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          { method: "POST", body }
        ).then(r => r.json());

        token.accessToken = res.access_token;
        token.picture = (await res).picture;   // si tu API la devuelve
      }
      return token;
    },

    /** Lo que llegará a useSession() en tus componentes */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.image = token.picture as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
