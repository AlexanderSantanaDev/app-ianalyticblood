import NextAuth, {
  type NextAuthOptions,
  type DefaultSession,
  type User,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { publicApiFetch } from "@/lib/api/client";

/* Extend User type to include accessToken, refreshToken, and provider */
declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
  }
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }
}

/* Helper function to fetch Google avatar */
async function fetchGoogleAvatar(accessToken: string | undefined) {
  if (!accessToken) {
    console.log("No accessToken provided for fetchGoogleAvatar");
    return null;
  }

  try {
    const res = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
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
          redirect_uri: process.env.NODE_ENV === "production"
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
        if (!credentials) return null;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            body: new URLSearchParams({
              username: credentials.email,
              password: credentials.password,
            }),
          }
        );
        if (!res.ok) return null;

        const data = await res.json();

        return {
          id: credentials.email,
          email: credentials.email,
          name: credentials.email,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          provider: "credentials",
        } as User & { accessToken: string; refreshToken: string; provider: string };
      },
    }),
  ],

  session: { strategy: "jwt" },
  useSecureCookies: process.env.NODE_ENV === "production",

  /* Callbacks */
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await publicApiFetch<{ access_token: string; refresh_token: string }>(
            "/auth/google",
            {
              method: "POST",
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                picture: user.image, // ➡️ Enviamos la imagen proporcionada por Google
                provider: "google",
              }),
            }
          );

          if (res) {
            user.accessToken = res.access_token;
            user.refreshToken = res.refresh_token;
            user.provider = "google";
          } else {
            return false;
          }
        } catch (error) {
          console.error("Error al registrar/iniciar sesión con Google en el backend:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image ?? null;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.provider = user.provider;
      }

      if (account?.provider === "google" && account.access_token) {
        console.log("Google account access_token:", account.access_token); // ➡️ Log para depurar
        token.googleAccessToken = account.access_token as string;
      }

      // ➡️ Intentamos obtener la imagen si no está presente
      if (!token.picture && token.googleAccessToken) {
        console.log("Attempting to fetch Google avatar with access_token:", token.googleAccessToken);
        const fetchedPicture = await fetchGoogleAvatar(token.googleAccessToken as string);
        if (fetchedPicture) {
          token.picture = fetchedPicture;
        }
      }

      // ➡️ Log para verificar el estado de token.picture
      console.log("Token picture after fetch attempt:", token.picture);

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        name: token.name,
        email: token.email,
        image: token.picture ?? null, // ➡️ Aseguramos que session.user.image sea token.picture
      };
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;

      // ➡️ Log para depurar session.user.image
      console.log("Session user image:", session.user.image);

      return session as DefaultSession & { accessToken?: string; refreshToken?: string };
    },

    redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };