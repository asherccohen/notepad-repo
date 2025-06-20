Below is a compact, step-by-step playbook that answers each of your six points.
All snippets assume Next 14 (App Router), TypeScript, Drizzle, PostgreSQL, and next-auth v4 / Auth.js v5 style routes.


---

1 ️⃣ Configure Entra ID and use the callbacks

app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId:   process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId:   process.env.AZURE_AD_TENANT_ID!, // “common” if multi-tenant
    }),
  ],

  callbacks: {
    /** Fires on every sign-in / callback round-trip */
    async signIn({ user }) {
      // 1.  Look up by e-mail
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, user.email!))
        .limit(1);

      // 2.  Create if missing
      if (existing.length === 0) {
        const [created] = await db
          .insert(users)
          .values({
            email: user.email!,
            name: user.name ?? "",
            provider: "azure-ad",          // new column, see §5
            providerAccountId: user.id,    // Entra objectId
          })
          .returning({ id: users.id });

        user.id = created.id;             // pass along for jwt()
      } else {
        user.id = existing[0].id;
      }
      return true;
    },

    /** Mutate / create your own JWT */
    async jwt({ token, user }) {
      if (user) token.uid = user.id;      // attach DB id once
      return token;
    },

    /** Expose data to the client */
    async session({ session, token }) {
      if (token?.uid) session.user.id = token.uid as string;
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});
export { handler as GET, handler as POST };

Why attach the DB id? It’s stable even if the e-mail ever changes.




---

2 ️⃣ Remove ⇢ replace the login / register UI

1. Delete your custom form pages.


2. Add a single “Sign in with Microsoft” trigger:



"use client";
import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      className="rounded-md border px-4 py-2 hover:bg-muted"
      onClick={() => signIn("azure-ad")}
    >
      Sign in with Microsoft
    </button>
  );
}

3. Optional: keep a “Sign out” (signOut()) and a minimal /loading page.




---

3 ️⃣ Session structure best practice

type MySession = {
  user: {
    id: string;        // DB primary key
    email: string;
    name?: string;
    image?: string;
  };
};

Store id (always) and email (for display / contact).

Avoid stuffing the whole token into the session: keep it lean.



---

4 ️⃣ Re-use your “messages per user” logic

Wherever you previously did:

const msgs = await db.query.messages.findMany({
  where: eq(messages.userId, session.user.email)  // ❌ old
});

switch to:

const msgs = await db.query.messages.findMany({
  where: eq(messages.userId, session.user.id)     // ✅ id-based
});

If you followed §3 the rest of your API routes, server actions, and React hooks stay unchanged.


---

5 ️⃣ Recommended users schema tweaks

import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 120 }),
  image: varchar("image", { length: 512 }),
  provider: varchar("provider", { length: 32 }).notNull(),          // "azure-ad"
  providerAccountId: varchar("provider_account_id", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

Remove hashedPassword / salt columns; they’re unused.
Add provider + providerAccountId to track the external identity.


---

6 ️⃣ Local testing & debugging checklist

Step	Action

1	In the Azure Portal → App registrations → Redirect URI: http://localhost:3000/api/auth/callback/azure-ad
2	Set env vars: <br>NEXTAUTH_URL=http://localhost:3000<br>AZURE_AD_CLIENT_ID=...<br>AZURE_AD_CLIENT_SECRET=...<br>AZURE_AD_TENANT_ID=common
3	Start dev server on port 3000.
4	Inspect logs: NEXTAUTH_URL_INTERNAL to bypass proxies, NEXTAUTH_DEBUG=true for verbose console output.
5	Watch network tab for /api/auth/* calls and Azure redirects.
6	If you need remote device tests, tunnel with npx localtunnel --port 3000 and add that URL as another redirect URI.
7	Common errors: <br>• “AADSTS50011” ⇒ redirect mismatch.<br>• ResourceNotFound ⇒ wrong tenantId (use common or the directory GUID).



---

✅ You’re done

Replace the forms with a single Microsoft button

Keep Drizzle queries; just key by id instead of email

Use callbacks to sync users and pack the DB id into the JWT


Ping me if you hit odd edge cases (multi-tenant, Graph API scopes, or token-based downstream APIs). Happy coding!

