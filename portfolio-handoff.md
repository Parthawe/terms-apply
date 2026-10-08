# Terms Apply / portfolio integration

The primary experience is now the continuous AI-player arena at `index.html`. The human-play version remains at `play.html`, and the physical kit is unchanged. The standalone study is `case-study.html`. Nothing has been published to designwhich.works.

## Host the arena before linking it

Deploy the Node worker from `server.mjs` on an always-on host with persistent storage. Use the included Docker/Compose setup and private environment configuration described in README.md. Set an OpenRouter key, a public HTTPS origin, and a separate operator token. Spectators watch without signing in; changing the roster or spending limits requires the operator token.

The game will not run continuously from a static upload. The server owns the state, model calls, turn loop and archive; closing a browser does not interrupt it. A sleeping laptop, stopped worker or exhausted API limit will stop progress. Use one worker per data directory.

## Integrate with the existing portfolio

The reference source is `<portfolio-source-checkout>`. That checkout was inspected for component conventions during the earlier prototype; it has not been edited in this delivery.

1. Create the project page at `/terms-apply` with the existing `ProjectHeader`, `CsMediaSpotlight`, `CsSection`, `CsBody`, `CsImage`, `CsThanks`, `BottomNav`, `NextProject` and `Footer` components. Translate the draft case study into those components and preserve the existing website typography and reading width.
2. Register the project in both `projects.ts` and the separate `projectRoutes.ts` manifest, following the repository's actual schema. Use the selected Terms Apply name. Proof of Purchase is superseded.
3. Use `assets/board.svg` and a verified arena screenshot as project imagery. Label them as digital prototypes. Do not describe unmade physical objects or unperformed user testing.
4. Set the main action to **Watch the arena**, linking to the deployed arena URL. Include **Play it yourself** and **Print the kit** as secondary actions. Until the arena is hosted, keep the page a local draft.
5. For the human game, copy `play.html`, `app.mjs`, `engine.mjs`, `content.mjs`, `style.css`, `print.html`, `rules.md`, `assets/board.svg`, and `output/pdf/terms-apply-kit.pdf` to the portfolio's public project assets folder. Imports are relative. Keep source-engine dependencies together.
6. If embedding the live arena, give the iframe an accessible title and an open-full-page action. Configure the arena CSP frame-ancestors explicitly for the portfolio origin; it currently refuses embedding. Keep operator controls on the full arena page. A simple link needs no CSP changes.

## Accurate project wording

“Terms Apply is a continuous board-game arena about using convenient services and resolving what follows. Players receive the same fictional tasks and dice rolls, then make independent decisions about work, evidence and obligations.”

Current status: working server and local-bot demo; OpenRouter adapter and model selection implemented; actual model calls await a key. Results describe this game only. Do not present demo bot scores as OpenAI, Claude, Gemini or other real-model results.

Visual direction borrows the white canvas, restrained type, thin rules and numbered navigation of https://impactbench.media.mit.edu/about. The game, board, identity and records are original. No MIT affiliation or benchmark claims.
