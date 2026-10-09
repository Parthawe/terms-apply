# Terms Apply

A short property game by Parth Pawar. Play against written demo strategies or connect OpenRouter for a private match against real models.

[Play the game](https://parthawe.github.io/terms-apply/) · [Key handling and privacy](https://parthawe.github.io/terms-apply/privacy.html)

## Play

Choose **Play free demo** to start with you, Claude and Gemini. Choose **Opponents** to select one to five opponents. Demo names identify authored game personas, not real model calls or measured brand behavior.

Everyone starts with $1,200. Roll locally, buy the street you reach or keep your cash. Rent, tax, news payments and turn advancement happen automatically. Color pairs double rent and unlock optional $100 houses: one per street, one building decision per turn. Passing Start pays $200. Timeout skips one turn. Insolvency sells assets back at half value; unpaid debt means bankruptcy. After ten turns each, highest cash plus original property and house value wins. The last solvent player wins early. Doubles do not grant extra turns.

The Three.js board uses familiar property-game colors and locally hosted brand marks. Phones default to the top view. Cash and street counts remain beside the board; **Details** contains property information, cash ledgers, strategies, sourced news and rules. Closing Details restores prior play. A finished match waits for an explicit Rematch or Change opponents action.

News is a sourced, versioned snapshot. A daily Codex follow-up checks for updates; the local host must be available for it to run. The site shows the last successful editorial check. Factual stories link to their sources; their cash effects are fictional and apply equally to whoever draws them. Each match preserves its deck. Results describe this game, not general AI ability. Terms Apply has no MIT, Monopoly or model-provider affiliation.

## Private real AI matches

Choose **Play real AI**, then **Connect OpenRouter** (PKCE) or **Paste an existing key instead**. Validation calls `GET /api/v1/key`, without a paid completion. Keys are retained only in the credential controller's memory and sent directly from the browser to OpenRouter over HTTPS. They are excluded from game saves, exports, URLs, logs and browser storage. Disconnect clears the key and aborts outstanding requests; reloading requires reconnection. This does not revoke a key at OpenRouter.

PKCE temporarily stores only its verifier, callback nonce, creation time and callback address in session storage. State expires after ten minutes, is consumed once, and callback parameters are removed from the address bar before the exchange. Cancelled, expired or mismatched callbacks cannot connect.

The public catalog supplies models and token prices. Each brand defaults to its cheapest eligible standard text model with structured responses and bounded output. Preview, experimental, specialized multi-agent, safeguard, image-output and audio-output variants are excluded. Setup shows exact model IDs and prices; OpenAI players display their actual model names, with Codex reserved for Codex models. Selection is an eligibility and price filter, not a quality recommendation.

AI dice are local. Only purchase and optional building decisions call a model. Requests have a 500-token output bound, strict JSON schema, required parameter support, provider price ceilings and disabled provider fallback. The application reserves a conservative cost estimate before dispatch and reconciles OpenRouter's reported cost afterward. Model explanations are escaped and credential patterns redacted before saving.

The default match threshold is **$0.25**, adjustable before starting, with **80 requests maximum**. API spending is separate from fictional dollars. A threshold is an application stop condition, not a guaranteed billing cap: provider pricing, interrupted requests or incomplete usage can make billing uncertain. Set [provider-side key limits](https://openrouter.ai/settings/keys) and check [OpenRouter activity](https://openrouter.ai/activity). Failures, missing costs, wrong models and invalid actions pause the match. No silent bot substitution, automatic paid retry or automatic paid rematch occurs. Explicit Resume retries a recoverable decision; unresolved billing blocks resume.

Saved private matches reopen paused and preserve their versioned rules (`quick-v2` for new market games), turn limits, selected model IDs, the news snapshot and a credential-free usage record. An in-flight reservation recovered after reload is treated as unresolved billing. Earlier demo saves and the shared operator runner retain their original twenty-turn, three-house rules.

**Verification:** automated tests use mocked credentials and provider responses. The public catalog and browser demo have been checked. A real-key paid smoke test has not been performed; the UI states that limitation.

## Develop and publish

Use Node.js 22 or later:

```sh
npm ci
npm test
npm run build:pages
npm start
```

The browser game is at `http://127.0.0.1:8765/`. GitHub Actions runs checks and publishes an explicit public-file allowlist to GitHub Pages. Three.js and the client are bundled locally. The entry page restricts scripts to this origin and connections to this origin and OpenRouter. Secrets, operator files and runtime data are excluded from Pages.

- `arena/quick-game.mjs`: finite beginner rules layered on the existing referee.
- `arena/private-runner.mjs`: private demo and model match orchestration, budget reservations and saves.
- `arena/credentials.mjs`: connect, validate, disconnect, PKCE and authenticated requests; no serializable credentials.
- `arena/private-client.mjs`, `arena/play.css`, `index.html`: playing, setup, Details and results.
- `arena/board3d.mjs`: shared Three.js board and responsive camera fitting.
- `arena/private-play.test.mjs`: rules, accounting, secret exclusion, PKCE, reload, disconnect, duplication, cost and model failure tests.
- `privacy.html`: accurate key-handling and game conditions.

### Explicit real-key smoke test

On the published HTTPS site, connect a disposable inference key with a small provider-side limit. Confirm validation does not create a completion. Start a one-opponent match, roll and make your decision, then wait for the opponent's first genuine purchase/building decision. Confirm its exact model, legal move and cost against OpenRouter activity. Disconnect, inspect the exported record for key exclusion, reload and verify reconnection is required. Do not mark paid play verified until this passes. Never paste the key into chat or commit it.

## Separate shared operator arena

`npm start` also runs the original shared server independently of private browser matches. Its UI is at `/operator.html`; its matches continue when the browser closes, while the Node process remains awake. Configure `.env` from `.env.example`, with `OPENROUTER_API_KEY` read only by the server. Public deployments require `ADMIN_TOKEN` and `PUBLIC_ORIGIN`; operator controls retain their token in page memory. These server credentials never enter the private browser game.

The shared runner retains its original twenty-turn rules, server ledger, archives, provider responses and daily limits (200 requests / $1 by default). `data/` is private runtime storage. One worker per data directory is required. Interrupted paid requests pause on restart; unknown costs require operator reconciliation. The operator server is not deployed by GitHub Pages.

`Dockerfile` and `compose.yaml` support an always-on HTTPS host with persistent storage. The Render blueprint is optional; free Render services sleep and have ephemeral storage, so they do not promise 24/7 operation. Hosting and API usage are separate costs.

The original task prototype is at `/play.html`; the project study, printable kit and earlier portfolio/social drafts remain separate.

API documentation: [OpenRouter PKCE](https://openrouter.ai/docs/guides/overview/auth/oauth). Brand asset sources: `assets/brands/SOURCES.md`.

## Market events

New games use `quick-v2`: confirmed IPOs show gross capital and listing fees as separate transfers; shareholder sales add no company cash; private funding is labeled capital, not operating revenue; outage recovery costs scale with owned streets. These effects are fictional teaching examples. Shares, dilution and stock prices are not simulated. Click the compact world-event link to see the source, business meaning and actual game calculation. Earlier matches keep their own rules and deck. See [news-maintenance.md](docs/news-maintenance.md) for the update contract.
