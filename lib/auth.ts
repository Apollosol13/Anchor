import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  trustedOrigins: [
    "io.anchrapp.anchor://",
    "https://anchor-bible.expo.app",
  ],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [expo()],
});
