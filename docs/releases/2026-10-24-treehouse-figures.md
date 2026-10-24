# Treehouse homecoming and shelf figurines

FLOPS remains an independent zone at https://vivalearn.space/flops. No portal, domain, database, or authentication configuration changes.

## Player experience
- A fourth empty clay room, the treehouse, is free for every player. Existing rooms, clothing, and furniture stay intact.
- The welcome card starts a permanent three-gift adventure. Three correct answers in Flags, Capitals, or Languages unlock a lantern. The following two local calendar days unlock a cushion and a shelf. Missed days never remove gifts. The normal five-bones-per-three-visits series is unchanged.
- Gift claims cost no bones, are repeat-safe, and persist with the account-scoped room snapshot. Cloud merges retain earned gifts and the highest answer progress. Signed-in room editing waits for the initial cloud read so a new empty room cannot replace an existing cloud layout during sign-in.
- Six clay figurines in Games and New: Rumi, Mira, Zoey, Alvin, Simon, Theodore. Each costs 8 bones. Only purchased figures enter the room inventory.
- All six fit all four shelf variants. Supports keep up to three separate objects; full shelves are disabled in the destination picker. Figures follow shelves when moved and their parent relationships persist.

## Art
Ten optimized WebP assets: empty treehouse, six alpha figurines, lantern, cushion, and shelf. Generated with built-in image_gen. Source files and prompt specifications: ../treehouse-assets.json. Object foot anchors measured from alpha bounds for contact with shelf surfaces.

## Validation
69 automated tests including calendar boundaries, duplicate claims, missed days, old-save migration, cloud merge, figure prices, support relationships, and all existing game tests. TypeScript and targeted lint. Browser checks: three real language answers unlock the gift; claim survives reload; 8-bone purchase and placement survive reload; six figures on two shelves; 390px viewport without horizontal overflow. Temporary QA fixtures removed before publication.
