You're hitting a CORS + HTTPS + Vite dev server edge case. Here's a breakdown of the issue and how to fix it.


---

🔍 The Setup

1. Vite App


2. Custom plugin that modifies the response for a specific file (@neo-build.js) to add CORS headers.


3. You access the dev server at a custom HTTPS domain, e.g., https://custom-domain.1441.net


4. The hosting proxy is smart: it routes to either prod or dev artifacts depending on availability or command.




---

🧠 Likely Hosting Proxy Setup

Your provider is probably:

Proxying requests to the local dev server (localhost:5173) when in dev.

Serving static files from /dist when npm run build is used.


Some setups (e.g. Netlify-style) use a config like:

location / {
  try_files $uri @vite_dev;
}

location @vite_dev {
  proxy_pass http://localhost:5173;
}

Or it's a node-based proxy that checks if the dev server is running and switches upstream.


---

❌ The Problem

You said:

> @neo-build.js file fails to be downloaded due to CORS: wildcard not allowed



When you load the page from https://custom-domain.1441.net, the browser enforces CORS rules strictly for cross-origin requests, especially under HTTPS.

Wildcard * in Access-Control-Allow-Origin is not allowed when:

Credentials (cookies, Authorization) are involved

You're making a cross-origin script request (especially with type="module")



---

✅ The Fixes

🔧 Option 1: Use Specific Origin Instead of *

In your plugin that adds CORS headers, instead of:

res.setHeader('Access-Control-Allow-Origin', '*')

do:

res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '')
res.setHeader('Vary', 'Origin')

This allows the response to echo the request origin (https://custom-domain.1441.net), which is CORS-compliant.

Also ensure:

res.setHeader('Access-Control-Allow-Credentials', 'true')

if cookies or auth are needed.


---

🔧 Option 2: Add HTTPS and Correct Host to Vite Dev Server

In vite.config.ts:

server: {
  https: true,
  host: '0.0.0.0', // or specific IP/domain
  cors: false, // let your plugin handle it
  origin: 'https://custom-domain.1441.net'
}

Make sure you generate or use a trusted SSL cert.


---

🔧 Option 3: Use a Reverse Proxy That Rewrites CORS

Let your hosting proxy (nginx, fastify, etc.) rewrite the CORS headers only for the dev server.

For example, in fastify:

app.register(require('@fastify/http-proxy'), {
  upstream: 'http://localhost:5173',
  rewriteRequestHeaders: (originalReq, headers) => {
    headers.origin = 'https://custom-domain.1441.net'
    return headers
  },
  rewriteResponseHeaders: (headers) => {
    headers['access-control-allow-origin'] = 'https://custom-domain.1441.net'
    headers['vary'] = 'Origin'
    return headers
  }
})


---

🧪 Debugging Tips

Use Chrome DevTools > Network > Headers tab to confirm what Origin is being sent, and what the server replies.

Look for errors like CORS policy: No 'Access-Control-Allow-Origin'.



---

🛠️ Recap

Fix	Description

Replace * with req.headers.origin	Browser-compatible
Adjust Vite dev server origin	Avoids CORS entirely
Proxy-level CORS override	Centralized fix
Ensure https + matching origin	Browser won't downgrade security



---

Let me know if you want help patching your Vite plugin or if you need help inspecting the dev server headers.

