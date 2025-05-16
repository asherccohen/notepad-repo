Microsoft Entra ID + NextAuth.js + Azure OpenAI + @ai-sdk/azure: Internal Auth Architecture

Context

Internal documentation for an enterprise-grade internal tool at a multinational banking company using Next.js, NextAuth.js, Microsoft Entra ID, @azure/identity, and @ai-sdk/azure. This doc explains user authentication, secure token exchange, and usage of Azure OpenAI both with API Key and token-based auth.

Supports:

Local development

Cloud deployment (Docker + Kubernetes)



---

Part 1 – Microsoft Entra ID Authentication with NextAuth.js

To authenticate users or backend services using Microsoft Entra ID (formerly Azure AD), you'll need to register an application and retrieve credentials like client_id, client_secret, and optionally configure scopes and redirect URIs. Here's a step-by-step guide to do this properly in 2024 using the latest Microsoft Entra portal:


---

1. Sign in to Microsoft Entra Admin Center

Go to: https://entra.microsoft.com

Use a Microsoft 365 work/school account with admin privileges (or developer tenant).


---

2. Register a New App

1. Navigate to "Applications" → "App registrations"


2. Click "New registration"



Fill in:

Name: e.g., NextAuth Entra App

Supported account types:

Choose "Accounts in this organizational directory only" for internal use

Choose "Multitenant" if needed across tenants


Redirect URI (optional for now):

If using NextAuth, add:

http://localhost:3000/api/auth/callback/entra-id

Replace localhost with your prod domain later.



Click "Register"


---

3. Get Your Credentials

Once registered, you’ll see:

Application (client) ID → use as AZURE_CLIENT_ID

Directory (tenant) ID → needed only for some flows, like client credentials

Object ID → ignore unless doing advanced role access



---

4. Create a Client Secret (for server-side use)

1. In the App’s sidebar, go to Certificates & secrets


2. Under Client secrets, click "New client secret"


3. Add a name like prod-secret, set expiry (12 months is fine)


4. Save it — you’ll only see the Value once → use this as AZURE_CLIENT_SECRET




---

5. Configure Redirect URIs

For web-based logins (like next-auth):

1. Go to "Authentication"


2. Under Web, click "Add a platform"


3. Choose Web, and input:

http://localhost:3000/api/auth/callback/entra-id

Or production:

https://your-domain.com/api/auth/callback/entra-id



Check:

Access tokens (enabled)

ID tokens (enabled)


Click Save


---

6. (Optional) Expose API or Add Scopes

If your backend or Azure OpenAI requires custom scopes:

Go to "Expose an API"

Add scopes like api://<client_id>/.default



---

7. (Optional) Assign API Permissions

For service-to-service calls or admin consent:

1. Go to API permissions


2. Click "Add a permission"


3. Choose:

Microsoft Graph (for user info)

Custom APIs if you registered another backend app



4. Click "Grant admin consent" if needed for all users




---

Summary of Variables for .env

AZURE_CLIENT_ID=<from portal>
AZURE_CLIENT_SECRET=<from Certificates & Secrets>
AZURE_TENANT_ID=<optional, needed for client credential flow>
AZURE_ISSUER=https://login.microsoftonline.com/<tenant_id>/v2.0
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your secret>


---

Let me know if you're using next-auth, @azure/identity, or @ai-sdk/azure, and I can tailor examples for each with those credentials.



Provider

Use next-auth/providers/microsoft-entra-id. It replaces the old azure-ad provider.

Required ENV Vars

AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID=<Application (client) ID>
AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET=<Client secret>
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0

Example config

// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import EntraIdProvider from 'next-auth/providers/microsoft-entra-id';

const handler = NextAuth({
  providers: [
    EntraIdProvider({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      if (account) token.access_token = account.access_token;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.access_token;
      return session;
    },
  },
});

export { handler as GET, handler as POST };

Token verification behavior

When using a provider (like Entra ID), NextAuth verifies JWTs using the issuer's JWKS.

If no provider is used, it falls back to verifying using the NEXTAUTH_SECRET env var.

So yes, you can write conditional logic:


if (process.env.NEXTAUTH_SECRET) {
  // fallback to local signing key
} else {
  // trust Microsoft Entra infrastructure
}


---

Part 2 – Azure OpenAI Auth via @ai-sdk/azure

Packages involved

@ai-sdk/azure: OpenAI access layer by Vercel

@azure/identity: Microsoft lib for acquiring tokens


Approaches

1. API key-based auth (default, simplest)


2. Bearer token via Microsoft Entra (for secure enterprise flows)



Vercel’s createAzure method

import { createAzure } from '@ai-sdk/azure';

const model = createAzure({
  baseUrl: process.env.AZURE_OPENAI_BASE_URL!,
  deployment: 'gpt-4',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

Gotcha

Even if you send an Authorization header with a bearer token, the lib still expects an apiKey, or else it throws. This is likely due to current implementation defaults.


---

Part 3 – Getting Bearer Tokens via @azure/identity

import { ClientSecretCredential } from '@azure/identity';

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!
);

const token = await credential.getToken('https://cognitiveservices.azure.com/.default');

> Observation: Even fake client_id and client_secret may return valid tokens in some dev setups. This could be due to cached credentials or fallback to other credential flows.




---

Part 4 – Auth flow summary

Context	Who is Authenticated	Auth Provider	Token Type

User Login	Interactive user	NextAuth via Entra	ID token / Access token
API-to-API	Server app	@azure/identity	Bearer token
OpenAI Access	Server app	@ai-sdk/azure	API key + (optionally) Bearer token



---

Part 5 – Questions Answered

Q: Do I need to pass tokens manually to Azure OpenAI?

A: If using bearer tokens, yes. Set them via headers. But apiKey is still required by the SDK.

Q: What’s the difference in token verification?

A: If you use Entra ID via provider, NextAuth uses Microsoft’s JWKS. If no provider is used, it uses NEXTAUTH_SECRET locally.

Q: What’s the default provider in NextAuth?

A: There is none. You must explicitly configure one. If no provider is configured and you still got authenticated, your app might have a fallback logic (e.g. a custom Credentials provider).


---

Let me know if you want this formatted as markdown or turned into a Confluence wiki page.

----

Yes, you can create a login flow with NextAuth + Entra ID that skips your own login screen and immediately redirects to the Microsoft SSO login — just like internal tools in enterprise environments.

Here's how it works:

Microsoft Entra ID (formerly Azure AD) supports SSO via redirect. If the user is already authenticated with Microsoft (e.g. via Microsoft 365), Entra ID will auto-sign them in, and they’ll land back on your app without needing to interact.


---

To enable this in NextAuth.js (App Router)

1. Use the Microsoft Entra ID Provider



// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import EntraIDProvider from 'next-auth/providers/microsoft-entra-id';

const handler = NextAuth({
  providers: [
    EntraIDProvider({
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      issuer: process.env.AZURE_ISSUER!, // e.g. https://login.microsoftonline.com/{tenant_id}/v2.0
    }),
  ],
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };

2. Redirect to login immediately if user is not authenticated



In your middleware:

// middleware.ts
import { auth } from 'next-auth';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const session = await auth();
  if (!session) {
    const callbackUrl = req.nextUrl.href;
    return NextResponse.redirect(
      new URL(`/api/auth/signin/entra-id?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'], // protect routes
};

3. Optional: Force login via Microsoft silently



To get SSO without interaction:

Make sure prompt=none is respected.

Microsoft login behavior depends on:

Whether the user is already signed in to Microsoft

Whether your domain is federated

The tenant’s policy



You can customize this by editing the authorization URL:

EntraIDProvider({
  // ...
  authorization: {
    params: {
      prompt: 'none', // or 'login' if you want a fresh login every time
    },
  },
});


---

Summary

Yes, you can skip your own login page and redirect straight to Microsoft login.

If users are already logged into Microsoft, SSO will auto-sign them in — no interaction.

You still need to trigger the sign-in explicitly via a redirect — use middleware or layout checks to do that.


Let me know if you want a client-only version (e.g. for a login button in a React component).

------
Great — if you're using Drizzle and want to monitor users, then yes, you should persist users in your own Postgres DB. This gives you full control over user tracking, audit, access control, etc.

Here’s exactly how to wire it up.


---

1. Add Drizzle Tables for NextAuth

NextAuth doesn't have official Drizzle support yet, so you’ll define your own schema. You can use this basic structure (can be extended later):

// schema/auth.ts
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
});

export const accounts = pgTable('accounts', {
  userId: varchar('user_id', { length: 255 }).notNull(),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  tokenType: text('token_type'),
  idToken: text('id_token'),
});

You can add sessions and verification tokens if you want to use a DB session strategy too.


---

2. Add a Custom Adapter

You need a custom Drizzle adapter. Since there's no official one yet, use this community adapter or write a thin one yourself. A solid open-source one:
drizzle-next-auth
Or I can help you write a minimal one.

Then wire it into your NextAuth config:

import { DrizzleAdapter } from './your-drizzle-adapter';
import { db } from '@/lib/drizzle'; // your drizzle client

const handler = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    EntraIDProvider({
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      issuer: process.env.AZURE_ISSUER!,
    }),
  ],
});


---

3. Monitor Users

Now you can:

Query the users table for audit, dashboards, admin panels

Track accounts to know where users logged in from

Optionally, relate users to teams, roles, etc.


You’ll also have access to their Microsoft profile data (name, email, avatar) at login.


---

TL;DR

Use Drizzle with a custom adapter

Define users and accounts tables

Add the adapter to NextAuth config

Microsoft Entra ID provider fills these on login

You can now fully monitor and extend user activity


Let me know if you want me to generate the full Drizzle adapter for NextAuth.



