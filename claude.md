# Claude Guidance

## Project Snapshot

This directory contains a static browser application for multiplication practice:

- `index.html` is the main practice game.
- `dashboard.html` is the progress map.
- There is no build system, package manager, framework, or server requirement.
- The app is written as plain HTML, CSS, and JavaScript inside each page.
- Progress is stored in `localStorage` under `multiply_learn_states`.

The target user is a child aged 7 to 10. Keep the experience playful, clear, encouraging, and easy to use without adult help.

## Product Goal

Create and maintain a multiplication training application that helps children learn multiplication facts from `2 x 1` through `10 x 10`.

The app should support:

- Choosing one or more multiplication tables.
- Practicing facts through multiple-choice and typed-answer modes.
- A low-pressure learning mode and a timed challenge mode.
- Persistent progress tracking across sessions.
- A dashboard that shows mastery and facts that need more practice.

## Existing Learning Model

The app tracks each fact with a compact state code:

- `n`: not tried yet.
- `lg`: answered correctly once.
- `dg`: mastered.
- `or`: struggled.
- `rd`: needs review.

Keep this state model unless there is a clear reason to migrate it. If you change storage format, include backward-compatible loading or a migration path.

Current answer behavior:

- Correct answers promote a fact toward mastery.
- Wrong answers move a fact toward review.
- Non-mastered facts are re-added to the practice queue.
- Harder states are prioritized before easier states.

This spaced-review style is central to the app. Preserve it when adding features.

## Implementation Rules

- Use plain HTML, CSS, and vanilla JavaScript.
- Keep the app runnable by opening `index.html` in a browser.
- Do not add frameworks, bundlers, or dependencies unless explicitly requested.
- Keep edits scoped and understandable; this is a small educational app, not a large architecture project.
- Prefer shared concepts and naming already present in the files.
- Avoid introducing network calls or accounts. Children should be able to use the app offline.
- Test changes manually in a browser after editing.

## UX Guidelines For Ages 7-10

- Use short, concrete Turkish text.
- Keep instructions visible only where they help the child act immediately.
- Avoid dense paragraphs.
- Use large tap targets and readable type.
- Make feedback immediate: correct, wrong, remaining count, and progress should update quickly.
- Encourage practice without shaming wrong answers.
- Avoid time pressure by default; timed mode should remain optional.
- Do not overload the first screen. The main task should stay obvious: choose tables, choose mode, start.

## Visual Design Guidelines

- Preserve the cheerful visual direction: bright background, rounded panels, orange action color, large buttons.
- Maintain responsive layouts for mobile and desktop.
- Avoid text overlap on small screens.
- Keep buttons large enough for touch.
- Use visual progress markers consistently across the practice page and dashboard.
- Emoji can be used as friendly status markers, but do not rely on emoji alone when meaning matters.

## Accessibility

- Keep semantic structure with headings, buttons, links, and form inputs.
- Ensure interactive controls can be used with keyboard.
- Maintain visible focus styles where possible.
- Avoid color-only meaning. Pair color with text, symbols, or labels.
- Sound should be helpful but not required to understand success or failure.

## Code Notes

Important functions in `index.html`:

- `loadData()` and `saveData()` handle `localStorage`.
- `stateKey(n, m)`, `getState(d, n, m)`, and `nextState(current, correct)` manage fact state.
- `buildNumberButtons()` renders table selection with mastered counts.
- `buildEmojiPresets()` renders state filters.
- `buildQueue()` creates the practice order.
- `nextQuestion()` renders the next prompt.
- `handleChoice(btn, value)` grades answers and updates progress.
- `endGame(cleared)` shows the summary.

Important functions in `dashboard.html`:

- `buildGrid()` creates the progress grid.
- `buildLegend()` renders state meanings.
- `renderDashboard()` reads saved progress and updates the grid.

## Quality Checklist

Before finishing a change, verify:

- `index.html` opens without console errors.
- `dashboard.html` opens without console errors.
- Starting a practice session works.
- Multiple-choice and typed-answer modes both work.
- Progress persists after refreshing.
- The dashboard reflects practice progress.
- Resetting progress works only after confirmation.
- Mobile layout remains usable around 360px width.

## Encoding Warning

Some Turkish text and emoji may appear mojibaked in the current files if the file encoding was previously saved incorrectly. When editing user-facing text, preserve or restore valid UTF-8 so Turkish characters render correctly in the browser.

## Suggested Future Improvements

Good additions for this app:

- Parent/teacher summary view.
- Optional daily goal.
- Gentle streaks for consistent practice.
- Fact-specific hints such as skip-counting or repeated addition.
- Review session that automatically focuses on `or` and `rd` facts.
- Simple celebratory animations after mastery milestones.

Avoid additions that make the app feel like a login-based platform, a dashboard-heavy productivity tool, or a competitive game with penalties.
