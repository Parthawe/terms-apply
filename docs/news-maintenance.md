# Maintaining the market deck

The daily Codex follow-up checks primary sources, edits the deck, runs tests and publishes through GitHub Actions. It is an editorial check, not a continuous quote feed. It needs the local Codex host and network access; it can miss a scheduled check while the host is unavailable. The site shows the last successful check date and never claims a stale deck is live.

Keep `arena/news.mjs` to at most twelve market cards. Include recent product launches, infrastructure/compute changes, resolved outages, funding, confirmed IPO milestones and regulatory changes where there is reliable evidence. Preserve a small, clearly dated set of market lessons when they teach a useful distinction. Do not replace an older confirmed IPO with an unconfirmed rumor just to make it look fresh.

For each card record its stable ID, event date, category, status, headline, primary publisher, exact HTTPS source, paraphrased factual claim, business lesson and explicitly fictional game effect. Separate filing, proposed listing, pricing and completed IPO. A filing does not mean shares are trading. Separate primary capital issuance from existing-shareholder sales, funding from revenue/profit, and valuation from cash. Do not infer a real stock-price movement or investment return from a headline. Do not use model brands as recipients of automatic favorable events; any player can draw any card.

Existing mechanics:

- `cash`: a bounded, explicitly authored transfer. Funding is labeled capital rather than earned revenue. A secondary sale can have zero company cash effect.
- `ipo`: $200 gross capital in, $10 fees out, $190 net capital. These are fictional teaching amounts, not the issuer's real proceeds. Shares, dilution and prices are not simulated.
- `portfolio-cost`: $20 recovery cost per owned street, with a $20 minimum. The player’s actual cash transfer is computed at draw time.

Keep mechanics and their bounds unchanged during editorial updates. Changes to mechanics require a separately versioned rule change and tests. The current new-match version is `quick-v2`; `quick-v1` saves retain flat card payments. Each new match snapshots the deck, checked date and edition. Never rewrite saved matches or alter news partway through a match. Both demo and real models use the same deck and local referee. Model requests remain limited to purchase and building decisions.

Use `newsChecked` for the date of the successful editorial check and an edition starting with that date. If a source cannot be verified, do not mark that card newly verified or fabricate a replacement. Keep the previous checked date if verification of the retained deck is incomplete, and report the problem. Prefer no change to an unsupported update.

Before publishing run `npm test`, `npm run build:pages` and `git diff --check`. Check the Facts / Fictional game effect distinction, source links, dates and the saved-deck label in Details. Commit and push only this project’s reviewed changes. Verify the existing GitHub Pages workflow succeeds. Never call paid models, inspect API keys or change budgets during maintenance. Stay quiet if nothing changed; notify only for a meaningful published update, failure or required user action.
