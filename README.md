# Terms Apply

A continuous board-game arena and a human-play tabletop prototype by Parth Pawar.

## Free public demo

The GitHub Pages build runs five named demo players (Claude, Gemini, Codex, Grok and DeepSeek) in the visitor’s browser. It is a working spectator demo with device-local records. It stops when the page closes and makes no model API calls. This is separate from the full Node server.

[Browser demo](https://parthawe.github.io/terms-apply/) · [Deploy free Render demo server](https://render.com/deploy?repo=https://github.com/Parthawe/terms-apply)

GitHub Actions tests the game/server and publishes only an explicit public-file allowlist. Secrets, server data and internal notes are excluded from Pages.

The Render blueprint uses a free web service. Free Render services sleep after inactivity and have ephemeral storage, so this option does not promise 24/7 operation or permanent records. Hosting can be free; paid model calls are separate. Render requires your account and private runtime key setup. See [Render free service limits](https://render.com/docs/free).

## Run locally

From this folder run `./start-arena.sh`, or `npm ci && npm start` with Node.js 22 or later. Open http://127.0.0.1:8765/. The Node server replaces the earlier static Python server.

The arena begins with five visibly labeled demo players. They keep playing when no browser is open. The original solo/cooperative game remains at `/play.html`; existing browser saves are preserved on the same origin.

## Connect actual AI players

1. Copy `.env.example` to `.env` locally.
2. Set `OPENROUTER_API_KEY` to your OpenRouter key. Keep it out of chat, browser code, source control and public file storage.
3. Restart the Node server. Keys are read at startup.
4. Select **Player settings**. Search the live OpenRouter catalog, select 2–24 text models, set limits and start the table. Select OpenAI, Anthropic/Claude, Google/Gemini, DeepSeek or other available models by their actual IDs. Defaults are inexpensive catalog choices, not claims that those models are best.

Up to five players share a table; a larger roster rotates across successive games. Every move is a new model request. No chatbot UI, subscription or existing chat history is used. Failed requests pause the runner, and local bots never substitute for a real model. No real API calls have been verified in this delivery because no key is configured.

## Rules and records

The simple live edition gives each player 12 moves to finish at least three of five jobs. Each move prepares an answer (one turn with AI help, two turns manually), checks both facts (one turn), or submits a decision (one turn). Decisions are Right, Wrong, or Not enough information. Preparation and fact checking are required before deciding. Wrong or invalid moves cost a turn. Most finished jobs wins, then fewer wrong answers; ties share wins. Every player receives the same movement rolls. Board squares are visual landmarks, with no extra rules.

The Three.js board animates pieces after each action. The main view shows scores, the latest move and one current job. Detailed records stay behind an expandable section. The original human-play prototype and printable kit retain their older, more detailed rules. Simple-edition records use new save versions so they do not mix with the original arena scores.

The model sees legal actions, inspected sources and its own state. Authored answers and uninspected source text are omitted from prompts. Public explanations are short move statements; provider private reasoning is not requested or displayed.

`data/arena-state.json` stores the current match, roster, budget, recent results and statistics. Completed tables have `data/match-N.json` plus a full `matches.jsonl` archive. Real provider outputs and usage are retained in `provider-responses.jsonl`. Superseded unfinished tables are archived separately. Public pages show recent matches and can load full transcripts. Demo and real results are separated.

A graceful restart preserves the current table and running/paused state. A stop during a real in-flight request pauses on restart for inspection. Run only one worker per data directory; files are not a multi-worker database.

## Usage limits

The default is 200 API requests and USD 1 per UTC day. Both limits apply to this runner, not to the entire OpenRouter account. A conservative per-call token-price reservation is recorded before sending a request and replaced with reported provider cost afterward. Failed or interrupted requests retain the reservation. Catalog prices can change and this is not a provider-enforced account spending cap; set an account/key cap in OpenRouter as well. Missing cost data pauses the runner for ledger review. No other provider calls are made by local bots; fetching the public model catalog needs no key.

After a limit is reached, resume on a new UTC day or adjust the limit. If a response omitted cost, compare the OpenRouter ledger and reconcile `usage.cost`, `usage.estimatedCost` and `usage.unknownCosts` in the saved state with the server stopped before resuming. Do not erase usage just to bypass a limit.

## Public 24/7 deployment

An always-on server with persistent storage is required. This local computer stops serving when it sleeps or the process stops. Nothing has been deployed to designwhich.works.

`Dockerfile` and `compose.yaml` provide one persistent Node worker. On an always-on host, create a private `.env` with the OpenRouter key, an operator `ADMIN_TOKEN` and `PUBLIC_ORIGIN=https://your-arena-domain`. Ensure the mounted `data` folder is writable by the container's `node` user (UID 1000). Run `docker compose up -d --build` behind your HTTPS reverse proxy, passing the public Host header and forwarding `/api/events` without buffering. Keep the local container port bound to 127.0.0.1. Mount and back up the data folder.

Public spectators can read the board, records and results. Controls require the operator token; the UI retains it in memory for that page only. API keys are never entered in the browser. Static serving uses an explicit allowlist: `.env`, server sources and `data` files are excluded. Controls require a matching Origin and recognized Host. Add an arena link or embed on the portfolio after the server is hosted. A static portfolio upload cannot run this worker.

## Files and validation

- `index.html`, `arena/arena.css`, `arena/client.mjs`: live spectator arena.
- `server.mjs`, `arena/game.mjs`, `arena/provider.mjs`: persistent runner, referee and OpenRouter integration.
- `play.html`, `app.mjs`, `style.css`, `engine.mjs`, `content.mjs`: original human-play prototype.
- `case-study.html`, `print.html`, `rules.md`, `output/pdf/terms-apply-kit.pdf`: project study and physical kit.
- `portfolio-handoff.md`, `social-drafts.md`: website and campaign drafts.

Run `npm test` and `npm run build:pages`. Rule tests and mocked provider tests verify mechanics and integration contracts, not real model performance. Physical playtesting and actual paid model validation remain to be done.

Visual reference: https://impactbench.media.mit.edu/about. API reference: https://openrouter.ai/docs/api_reference/overview. Terms Apply is independent and has no MIT affiliation.
