Here’s a condensed, enhanced prompt that captures everything you asked and what we discussed, ready for an LLM to give a precise answer:


---

Prompt:

I want to build a simple web scraping CLI in Node.js with TypeScript.
The CLI should:

1. Accept a Confluence page URL as input.


2. Save the page’s main content in HTML format to a file.


3. Work when the Confluence REST API is disabled.


4. Handle authentication via SSO:

If I have an SSO cookie string (e.g., JSESSIONID=...; othercookie=...), use it to make authenticated HTTP requests.

If I don’t have a cookie, launch Puppeteer, log in manually (or automatically if possible), grab the SSO session cookies, and use them to fetch the page.



5. Use axios + axios-cookiejar-support + tough-cookie for HTTP requests and cookie handling.


6. Use cheerio to parse the HTML and extract #main-content.


7. Allow setting the output file path with a CLI option.



Also:

Show installation commands for required dependencies.

Show complete TypeScript code for both the cookie-based scraping version and the Puppeteer-assisted login version.

Include instructions for extracting cookies manually from the browser and passing them to the CLI.

Include usage examples for both modes.

Mention how to adapt the CSS selector for different Confluence layouts.



---

Do you want me to also optimize this prompt so it asks for production-ready, reusable code instead of just a minimal example? That way, an LLM would return something you can drop into a project right away.



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

