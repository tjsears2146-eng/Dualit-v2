# Duality Format Website

Production-ready static website for **dualityformat.com**, plus an optional Cloudflare Workers AI backend.

## What is included

- Cinematic animated landing page
- Canvas starfield, portal glows, rotating Resonance graphics, scroll reveals, and responsive navigation
- Full current Duality rules
- Browser-side structural deck checker
- Playtest poster download
- Resonance AI chat interface
- Built-in offline rules answers when the AI backend is not connected
- GitHub Pages deployment workflow
- Cloudflare Workers AI backend in `/worker`

## Publish the site on GitHub Pages

1. Back up your current repository.
2. Copy the website files into the root of the repository. Do not upload the outer ZIP folder itself.
3. Commit and push to `main`.
4. In GitHub, open **Settings → Pages**.
5. Set **Source** to **GitHub Actions**.
6. Confirm the custom domain is `dualityformat.com` and enable **Enforce HTTPS** after GitHub finishes provisioning it.

The included `CNAME` file contains `dualityformat.com`.

## Deploy Resonance AI

The public website is static. Never place an OpenAI key or any other private API credential in `config.js`, JavaScript, or GitHub Pages. Visitors can read those files. Humanity has already invented enough avoidable security incidents.

This package uses **Cloudflare Workers AI**, so no model API key is embedded in the site.

1. Create a free Cloudflare account.
2. Install Node.js on a computer.
3. Open a terminal in the `/worker` folder.
4. Run:

```bash
npm install
npx wrangler login
npm run deploy
```

5. Wrangler will return a URL similar to:

```text
https://duality-resonance-ai.<your-subdomain>.workers.dev
```

6. Open `/config.js` and paste that address into `aiEndpoint`:

```js
window.DUALITY_CONFIG = {
  aiEndpoint: "https://duality-resonance-ai.<your-subdomain>.workers.dev",
  supportEmail: "support@dualityformat.com"
};
```

7. Commit and push the change. The AI assistant will become live.

## Important AI notes

- The Worker only accepts requests from `dualityformat.com`, `www.dualityformat.com`, and localhost.
- The system prompt contains the current Duality rules.
- AI can still make mistakes. The website warns users to verify tournament-impacting rulings.
- For public launch, add Cloudflare Turnstile and durable rate limiting before promoting the AI heavily. Otherwise one enthusiastic goblin with a script can consume the allowance.

## Edit content

- Main page: `index.html`
- Design and animation: `styles.css`
- Deck checker and AI frontend: `script.js`
- AI endpoint: `config.js`
- AI rules and behavior: `worker/src/index.js`
- Poster: `assets/playtest-poster.jpg`

## Support email

The site uses `support@dualityformat.com` for event inquiries.

## Legal

Duality is an unofficial community format and is not affiliated with or endorsed by Wizards of the Coast.
