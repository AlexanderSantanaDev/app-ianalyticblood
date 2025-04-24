import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    /** JWT que emite tu FastAPI */
    accessToken?: string;
    user: {
      /** avatar que recibimos de Google o de la BD */
      image?: string | null;
      /** los campos que ya trae NextAuth (name, email, etc.) */
      name?: string | null;
      email?: string | null;
    };
  }

  interface JWT {
    accessToken?: string;
    picture?: string;
  }
}