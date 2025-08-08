Here’s your conversation distilled into a prompt-ready format that an LLM could take and immediately give you an answer:


---

Prompt:

I need to extract Confluence page content in bulk, but I don’t have API access.
Here’s the context:

Confluence type: Internal UBS instance at https://central-confluence.ubs.net

Access control: Corporate SSO (likely SAML, Kerberos, or similar)

Cookies available: JSESSIONID and cpsession from browser developer tools

Issue: Using curl with these cookies only returns a redirect or a link to the original page

Environment restrictions:

Cannot download Playwright’s bundled Chromium (blocked by corporate firewall)

Chrome is already installed on my machine

Node.js and npm are available


Goal: Extract full HTML/text of multiple Confluence pages in bulk, bypassing API, while authenticated through SSO

Possible constraints:

VPN required to access domain

Cookies may expire quickly

Need automation that can handle login or reuse authenticated sessions



What I want from you:
Given these constraints, provide the best working approach to bulk-extract pages, including:

1. How to handle SSO authentication without the API


2. How to use Playwright or Puppeteer without downloading browsers (pointing to system Chrome instead)


3. How to persist and reuse a logged-in session for repeated runs


4. Example code in TypeScript to scrape a list of Confluence pageIds




---

If you want, I can now rewrite this into an even more compact “single-shot” LLM prompt so you can paste it directly into another system. Do you want me to do that?

