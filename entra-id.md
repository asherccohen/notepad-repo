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

