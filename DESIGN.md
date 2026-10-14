# Terms Apply design direction

Apple-inspired consumer game UI, implemented with native CSS. This is an independent project, not an Apple framework or affiliation.

Use system sans-serif type, near-black ink, light gray page surfaces, white controls, and blue primary actions. Keep the board's property colors, model logos, original content, routes, keyboard controls and privacy text. The Three.js board remains the product demonstration.

The shared design.css theme covers the game, setup, details, results, privacy, original prototype, project study and printable-kit screen. Print media keeps the original kit geometry and typography. Desktop reading pages use generous space; the game keeps compact controls so phone play remains possible without scrolling in expanded mode.

QA must cover six-player roll and purchase states at phone sizes, the OpenRouter setup without credentials, details and recovery, results, privacy, the project study, legacy prototype and print preparation. Do not make paid requests as part of visual checks.

The 3D game uses locally generated paper grain, woven felt, satin token and glazed dice materials. Custom surface shaders extend Three.js PBR instead of replacing lighting and shadows. Street labels remain separate untextured planes. Shader effects are static, use small shared mipmapped textures, and avoid post-processing or external asset requests.

Dice use six fixed pip faces on rounded geometry, with opposite faces totaling seven. The presentation tumbles and bounces toward the referee's existing result; it does not generate a new result through physics. Dice settle before token movement and AI decisions advance. Reduced motion snaps to the result, and restoring a match does not replay a roll. Lighting uses a warm key, cool fill, bounded shadow maps and small contact-shadow planes; label planes retain unlit ink for phone readability.
