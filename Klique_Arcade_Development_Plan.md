# Klique Arcade --- Product & Development Plan

**Project:** Klique\
**Feature:** Klique Arcade (`/games`)\
**Document type:** Product requirements + implementation roadmap\
**Status:** Proposed plan\
**Primary goal:** Add a polished collection of lightweight JavaScript
games to Klique without making the existing tools experience feel
cluttered.

------------------------------------------------------------------------

## 1. Product vision

Klique Arcade is a small, browser-native game area inside Klique. It
gives visitors a quick way to take a break, challenge themselves, and
return to the tools they came for.

The experience should feel like a natural part of Klique---not a
separate gaming website. Reuse Klique's existing design language,
navigation patterns, typography, spacing, and theme support.

### Product principles

1.  **Fast:** games should load quickly and avoid unnecessary
    dependencies.
2.  **Focused:** each screen should make the game and its controls
    obvious.
3.  **Responsive:** desktop, tablet, and mobile play should all be
    supported.
4.  **Private by default:** scores and preferences stay in the browser;
    no account or backend is required for the first release.
5.  **Consistent:** use Klique's existing black/white foundation and
    lime accent `#daf4aa`.
6.  **No bloat:** do not add social feeds, chat, multiplayer servers, or
    unrelated features to the first release.

------------------------------------------------------------------------

## 2. Goals and success criteria

### Goals

-   Add a discoverable Arcade entry and a dedicated `/games` route.
-   Launch with a small but varied collection of reliable games.
-   Provide a consistent game shell: instructions, controls,
    pause/restart, sound setting, and results.
-   Save best scores locally.
-   Make keyboard and touch controls work where appropriate.
-   Keep game code isolated so new games can be added without rewriting
    the library.

### Initial success criteria

-   All launch games work on current desktop Chrome, Edge, Firefox, and
    Safari.
-   Layout works from narrow mobile widths through large desktop
    screens.
-   No game requires a sign-in, external account, or network request to
    play.
-   Best scores survive a page refresh on the same browser.
-   No horizontal overflow at supported viewport sizes.
-   Existing Klique tools and routes continue to work unchanged.
-   Production build passes lint/type checks (where configured) and has
    no new console errors during normal play.

------------------------------------------------------------------------

## 3. Release scope

### Release 1 --- Core Arcade

Build these five games first:

  --------------------------------------------------------------------------
  Priority       Game           Game type      Main input     Why it is in
                                                              the first
                                                              release
  -------------- -------------- -------------- -------------- --------------
  P0             Snake          Arcade         Arrow keys /   Familiar,
                                               WASD / touch   replayable,
                                               controls       compact

  P0             2048           Puzzle         Arrow keys /   Easy to learn,
                                               swipe          strong replay
                                                              value

  P0             Tic Tac Toe    Strategy       Mouse / touch  Quick
                                                              sessions;
                                                              supports a
                                                              simple local
                                                              AI

  P1             Memory Match   Brain          Mouse / touch  Good mobile
                                                              experience and
                                                              simple rules

  P1             Reaction Time  Skill          Mouse / touch  Very short
                                                              sessions and
                                                              easy score
                                                              comparison
  --------------------------------------------------------------------------

### Release 2 --- Library expansion

Only begin after Release 1 is stable:

-   Word Guess --- daily word can be generated locally from a bundled
    word list; avoid claiming a globally shared daily puzzle unless a
    server is introduced.
-   Minesweeper --- beginner, intermediate, and expert boards.
-   Brick Breaker --- canvas-based arcade game.
-   Typing Speed Challenge --- WPM, accuracy, and elapsed time.
-   Simon Says --- increasingly long color/sound sequences.

### Later / optional

-   Tetris-style falling blocks.
-   Space Shooter.
-   Pong.
-   Flappy-style obstacle game.
-   Whack-a-Mole.
-   Endless Runner.

These are not launch requirements. Add them only if the initial
collection is being used and the implementation remains maintainable.

### Explicitly out of scope for the first release

-   Online multiplayer or matchmaking.
-   Global leaderboards.
-   User accounts or cloud score sync.
-   Payments, ads, coins, rewards, or virtual currency.
-   User-generated games.
-   Downloadable desktop game packages.
-   A separate backend or database solely for Arcade.

------------------------------------------------------------------------

## 4. Information architecture and user flow

### Routes

-   `/games` --- Arcade library and category browsing.
-   `/games/snake`
-   `/games/2048`
-   `/games/tic-tac-toe`
-   `/games/memory-match`
-   `/games/reaction-time`

Use the project's existing routing conventions. If Klique currently uses
a different route structure, adapt these paths rather than introducing a
second router.

### Library page structure

1.  **Page heading:** "Arcade" with one short explanatory sentence.
2.  **Featured game:** one featured card, selected from the available
    games (not a large promotional banner).
3.  **Category filters:** All, Arcade, Puzzle, Brain, Skill.
4.  **Search:** filter games by title and short description.
5.  **Game grid:** consistent cards with title, category, concise
    description, and best score when relevant.
6.  **Recently played:** optional small row, shown only when there is
    local history. Do not show an empty placeholder.

Do not add a large dashboard of statistics. The games themselves should
remain the focus.

### Game screen structure

-   Back link to Arcade.
-   Game title and one-line objective.
-   Game board / play area.
-   Compact control row: Start or Restart, Pause when supported, Sound
    when supported.
-   Short controls/help text.
-   Score and best score, where relevant.
-   Clear game-over or completion state.
-   "Play again" action.

Keep game controls in predictable locations across games. Do not force
every game to show controls that do not apply.

------------------------------------------------------------------------

## 5. Design and interaction requirements

### Visual direction

-   Follow Klique's existing theme and component conventions.
-   Use `#daf4aa` as an accent, not as a large background fill.
-   Maintain readable contrast in both light and dark themes.
-   Use restrained borders, subtle surfaces, and clear focus states.
-   Use motion to communicate state changes, not as decoration.
-   Avoid neon overload, excessive gradients, fake 3D effects, and
    generic AI-generated gaming visuals.
-   Keep card density and padding consistent with the rest of Klique.

### Responsive behavior

-   Desktop: multi-column game grid; game board centered with useful
    surrounding space.
-   Tablet: fewer columns and appropriately scaled boards.
-   Mobile: single-column library; game controls reachable without
    horizontal scrolling.
-   Use touch targets large enough for comfortable tapping.
-   Prevent accidental page scrolling while swiping on a game board, but
    do not disable normal page scrolling everywhere.

### Accessibility

-   All buttons must have visible focus states and accessible names.
-   Do not rely on color alone to communicate game state.
-   Respect `prefers-reduced-motion`.
-   Provide text instructions for keyboard and touch controls.
-   Ensure text contrast is sufficient in both themes.
-   Do not trap keyboard focus.
-   For games that use canvas, provide accessible surrounding controls
    and status text.

------------------------------------------------------------------------

## 6. Technical approach

### Recommended stack

Use the stack already present in Klique:

-   React for page and game UI.
-   JavaScript for game rules and state.
-   Existing router for routes.
-   Existing Tailwind/CSS conventions for styling.
-   Existing Framer Motion only for small transitions where it is
    already used.
-   HTML Canvas only for games that genuinely need continuous drawing
    (for example, Brick Breaker or Space Shooter).
-   `localStorage` for local preferences, best scores, and recently
    played games.

Do not introduce Phaser for the first five games. Most of them are
better implemented as normal React components. Consider Phaser only if
the Arcade later grows into a larger real-time canvas game collection.

### Suggested folder structure

Adapt names to the existing Klique source tree; do not duplicate an
existing components, hooks, or pages folder.

``` text
src/
  pages/
    GamesPage.jsx
    games/
      SnakePage.jsx
      Game2048Page.jsx
      TicTacToePage.jsx
      MemoryMatchPage.jsx
      ReactionTimePage.jsx

  components/
    games/
      GameCard.jsx
      GameGrid.jsx
      GameShell.jsx
      GameControls.jsx
      GameResult.jsx
      GameInstructions.jsx
      GameCategoryFilter.jsx

  games/
    catalog.js
    storage.js
    constants.js
    snake/
      SnakeGame.jsx
      snakeLogic.js
    2048/
      Game2048.jsx
      game2048Logic.js
    tic-tac-toe/
      TicTacToe.jsx
      ticTacToeLogic.js
    memory-match/
      MemoryMatch.jsx
      memoryLogic.js
    reaction-time/
      ReactionTime.jsx
      reactionLogic.js
```

Keep pure game rules separate from rendering wherever practical. This
makes logic easier to test and prevents UI changes from breaking game
rules.

### Game catalog

Create one catalog as the source of truth for the library. Each game
entry should contain:

-   Stable `id`.
-   `title`.
-   `description`.
-   `category`.
-   `route`.
-   `controls` summary.
-   `featured` boolean (at most one featured game).
-   Optional score label and thumbnail/illustration reference.

Do not hardcode separate game lists in the search, filters, and cards.

### Local storage design

Use a namespaced key to avoid collisions with other Klique tools.

Suggested keys:

``` text
klique:arcade:settings
klique:arcade:high-scores
klique:arcade:recently-played
```

Guidelines:

-   Validate parsed values before using them.
-   Handle missing, malformed, or blocked localStorage gracefully.
-   Do not store unnecessary personal information.
-   Store only the minimum data required.
-   Keep a storage version field so future schema changes can be
    migrated safely.
-   Never make the game unusable if storage is unavailable; fall back to
    in-memory state.

Suggested high-score structure:

``` js
{
  version: 1,
  scores: {
    snake: { best: 24 },
    "2048": { bestTile: 1024 },
    "tic-tac-toe": { wins: 4, losses: 2, draws: 1 },
    "memory-match": { bestMoves: 18 },
    "reaction-time": { bestMs: 245 }
  }
}
```

These are illustrative fields; define the final score metric per game
and compare scores in the correct direction (for example, lower reaction
time is better).

------------------------------------------------------------------------

## 7. Game-specific requirements

### 7.1 Snake

**Objective:** collect food, grow the snake, and avoid walls and the
snake's own body.

Requirements: - Start screen with concise instructions. - Arrow key and
WASD support. - Mobile directional controls or swipe input. - Pause and
resume. - Restart after game over. - Score and best score. - Prevent an
immediate 180-degree reversal. - Prevent multiple movement updates from
one key press. - Consistent game tick; do not tie movement speed to
render frame rate. - Increase difficulty gradually and cap it at a fair
maximum. - Clean up keyboard listeners and animation/timer loops on
unmount.

Acceptance checks: - Snake cannot move outside the board without
triggering game over. - Food never spawns inside the snake. - The snake
cannot reverse directly into itself. - Pause actually stops movement. -
Restart resets board, direction, and score.

### 7.2 2048

**Objective:** combine equal numbered tiles to create higher values.

Requirements: - 4×4 board for the standard mode. - Arrow keys and swipe
controls. - One new tile appears only after a valid move. - A tile can
merge only once per move. - Score and best score. - Win state when 2048
is reached; allow continuing after the win. - Game-over detection when
no legal moves remain. - New game confirmation if a game is in progress.

Acceptance checks: - Tiles slide in the correct direction. - Equal tiles
merge correctly and never merge twice in one move. - Invalid moves do
not spawn a tile. - Score increases by the value of merged tiles. - Win
and game-over states are detected correctly.

### 7.3 Tic Tac Toe

**Objective:** get three marks in a row, column, or diagonal.

Requirements: - Local two-player mode. - Play against computer mode. -
Clear turn indicator. - Win, draw, and restart states. - AI should make
legal moves and block immediate wins where possible. - Difficulty can be
a later enhancement; do not overbuild AI for launch.

Acceptance checks: - A completed game cannot accept further moves. - Win
detection covers all rows, columns, and diagonals. - Draw is detected
when the board is full with no winner. - AI never selects an occupied
cell. - Restart clears the board and resets the starting player.

### 7.4 Memory Match

**Objective:** reveal cards and find every matching pair.

Requirements: - Small, mobile-friendly grid (for example, 4×4). -
Shuffle pairs at the start of each new game. - Prevent more than two
unmatched cards from being active. - Briefly show mismatched cards
before hiding them again. - Track moves and elapsed time. - Completion
state and play-again action. - Do not rely on emoji alone if the visual
style becomes inconsistent; use a consistent icon set or simple
illustrations.

Acceptance checks: - Each card has exactly one matching pair. - A
matched pair stays visible and cannot be selected again. - Input is
temporarily locked while a mismatch is being resolved. - Completion
occurs only when every pair is matched. - Reset creates a newly shuffled
board.

### 7.5 Reaction Time

**Objective:** click or tap as soon as the target changes to the "go"
state.

Requirements: - Ready state, waiting state, go state, and result
state. - Randomized wait period within a safe bounded range. - Early
clicks are identified as false starts. - Record the result in
milliseconds. - Best time and retry action. - Optional five-round
average can be added if it remains simple.

Acceptance checks: - A click before the go signal never records a valid
score. - A result is recorded only once per round. - Timer is cleaned up
when leaving or restarting. - Best time is updated only when the new
valid time is lower.

------------------------------------------------------------------------

## 8. Shared component behavior

### GameShell

Responsibilities: - Consistent page width and spacing. - Back
navigation. - Title and short description. - Standard content area for
the game. - Optional help/instructions region. - Responsive layout.

It should not contain game rules or own game-specific score
calculations.

### GameControls

Responsibilities: - Render only controls supported by the current
game. - Use accessible button labels. - Disable actions when they are
not valid. - Keep button styling consistent with Klique.

### GameResult

Responsibilities: - Show win, loss, draw, or completed state. - Display
the relevant score or result. - Offer a restart action. - Avoid blocking
dialogs for normal game completion.

### GameCard

Responsibilities: - Display game title, category, short description, and
optional best score. - Entire card should have a clear click target. -
Include hover and keyboard focus states. - Do not show fake ratings,
player counts, or popularity metrics.

------------------------------------------------------------------------

## 9. Implementation roadmap

Build in small phases and verify each phase before moving on.

### Phase 0 --- Audit the existing Klique app

-   [ ] Inspect current routes, layout, navigation, theme system, and
    shared components.
-   [ ] Identify the correct place for the Arcade navigation entry.
-   [ ] Check existing icon, animation, and CSS conventions.
-   [ ] Confirm whether a page-level layout already handles responsive
    width.
-   [ ] Record existing build and lint commands.
-   [ ] Avoid changing unrelated tools or global styles.

**Deliverable:** a short implementation map showing which existing files
will be reused and which new files will be created.

### Phase 1 --- Arcade foundation

-   [ ] Add `/games` route.
-   [ ] Add Arcade navigation entry using existing navigation patterns.
-   [ ] Create game catalog.
-   [ ] Build library page, search, category filters, and game cards.
-   [ ] Build reusable GameShell and GameControls.
-   [ ] Add local storage helper with validation and versioning.
-   [ ] Add empty, loading, and unavailable-storage handling only where
    needed.
-   [ ] Verify light and dark themes.

**Exit criteria:** library page works with placeholder catalog entries
and all navigation is correct.

### Phase 2 --- First playable games

Recommended order:

1.  [ ] Snake.
2.  [ ] 2048.
3.  [ ] Tic Tac Toe.
4.  [ ] Memory Match.
5.  [ ] Reaction Time.

For each game: - \[ \] Implement pure game logic. - \[ \] Implement
responsive UI. - \[ \] Add instructions and controls. - \[ \] Add
reset/restart behavior. - \[ \] Add local best-score/history handling. -
\[ \] Test edge cases. - \[ \] Verify cleanup of listeners, timers, and
animation loops.

**Exit criteria:** each game is independently playable and passes its
acceptance checks.

### Phase 3 --- Polish and quality

-   [ ] Add subtle page and state transitions.
-   [ ] Add reduced-motion support.
-   [ ] Add keyboard focus and accessible labels.
-   [ ] Verify touch controls on mobile.
-   [ ] Verify no page-level horizontal overflow.
-   [ ] Test malformed local storage data.
-   [ ] Test refresh, back navigation, and direct route loading.
-   [ ] Check performance and remove unnecessary dependencies.
-   [ ] Check that no game blocks the rest of Klique.

**Exit criteria:** all launch games work consistently across target
browsers and screen sizes.

### Phase 4 --- Release

-   [ ] Run production build.
-   [ ] Run lint and available tests.
-   [ ] Test deployed routes, not only the local development server.
-   [ ] Check browser console and network panel.
-   [ ] Confirm existing Klique tools still work.
-   [ ] Add concise Arcade documentation to the project README if
    appropriate.
-   [ ] Release the feature behind the normal Klique deployment process.

**Exit criteria:** production deployment is stable and no existing tool
functionality regresses.

### Phase 5 --- Measure and expand

After release, review: - Which games are opened most often. - Which
games are replayed. - Whether users reach game-over/completion states. -
Whether mobile controls cause problems. - Whether users return to the
Arcade.

Use privacy-conscious, aggregated analytics only if Klique already has
an appropriate analytics setup and consent model. Do not add tracking
solely for this feature without a clear need.

Add Release 2 games based on actual use and maintenance capacity.

------------------------------------------------------------------------

## 10. Testing checklist

### Functional

-   [ ] Each game starts, pauses where supported, restarts, and ends
    correctly.
-   [ ] Scores update correctly.
-   [ ] Best scores persist after refresh.
-   [ ] Search and category filters work together.
-   [ ] Recently played list updates and handles missing data.
-   [ ] Direct links to game routes work.
-   [ ] Browser back navigation behaves correctly.

### Responsive

-   [ ] Small mobile screen.
-   [ ] Large mobile screen.
-   [ ] Tablet portrait and landscape.
-   [ ] Laptop.
-   [ ] Large desktop.

### Input

-   [ ] Keyboard input.
-   [ ] Mouse input.
-   [ ] Touch/swipe input where supported.
-   [ ] Focus remains usable after dialogs or result states.

### Reliability

-   [ ] No stale intervals or timeouts after leaving a game.
-   [ ] No duplicate keyboard listeners.
-   [ ] No state updates after component unmount.
-   [ ] Invalid localStorage JSON does not crash the app.
-   [ ] Storage unavailable does not prevent playing.
-   [ ] No new console errors.
-   [ ] Production build succeeds.

### Regression

-   [ ] Existing `/tools` route still works.
-   [ ] Existing PDF, QR, image, text, and developer tools still work.
-   [ ] Theme switching still works.
-   [ ] Existing navigation and mobile menu remain unchanged.

------------------------------------------------------------------------

## 11. Risks and how to avoid them

  -----------------------------------------------------------------------
  Risk                                Prevention
  ----------------------------------- -----------------------------------
  Arcade makes Klique feel cluttered  Keep it as a separate route and
                                      reuse existing navigation

  Game logic becomes tangled with UI  Keep pure logic modules separate

  Timers continue after leaving a     Centralize cleanup in effects and
  game                                game lifecycle

  Mobile controls feel awkward        Design and test touch controls from
                                      the beginning

  Scores become corrupted             Validate storage and include a
                                      schema version

  Too many games delay launch         Ship five games in phases; defer
                                      the rest

  New dependencies increase bundle    Use React/CSS for simple games and
  size                                Canvas only when needed

  Styling conflicts with existing     Scope Arcade styles and reuse
  tools                               design tokens
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 12. Definition of done

Klique Arcade is ready for its first release when:

1.  The `/games` page is accessible through Klique navigation.
2.  The five Release 1 games are complete and playable.
3.  Each game has clear instructions and appropriate controls.
4.  The layout works on desktop and mobile.
5.  Best scores and settings are stored locally and safely.
6.  Keyboard, touch, and accessibility basics are covered.
7.  Timers and event listeners are cleaned up correctly.
8.  The production build passes.
9.  Existing Klique tools and navigation pass regression checks.
10. No unrequested backend, account, multiplayer, payment, or tracking
    system has been added.

------------------------------------------------------------------------

## 13. Suggested development order at a glance

``` text
Audit current Klique
       |
       v
Create /games route + catalog
       |
       v
Build library UI + shared game shell
       |
       v
Add local storage helper
       |
       v
Snake -> 2048 -> Tic Tac Toe
       |
       v
Memory Match -> Reaction Time
       |
       v
Responsive + accessibility + regression testing
       |
       v
Production release
       |
       v
Review usage -> choose Release 2 games
```

## 14. Guidance for the coding agent

When implementing this plan:

-   First inspect the existing repository. Do not assume its folder
    structure or rewrite its router.
-   Preserve Klique's current design system, theme behavior, navigation,
    and existing tools.
-   Do not redesign unrelated pages.
-   Do not add features that are not in this plan without asking first.
-   Prefer small, reviewable changes and implement one phase at a time.
-   Do not use placeholder buttons or pretend interactions.
-   Test each game's rules and edge cases before polishing animations.
-   Keep dependencies minimal and explain any new dependency before
    adding it.
-   If an existing project convention conflicts with this document,
    follow the existing convention and adapt the plan without breaking
    current functionality.

**Recommended first task:** complete Phase 0, then implement Phase 1
before building any individual game. This creates a stable foundation
and prevents five separate games from developing five different layouts
and storage systems.
