# Authoring guide: writing HTML worth sharing

Read this before generating HTML that will be published with htmltolink. The
genre is specific: **one self-contained file, opened cold by strangers, usually
on a phone, arriving from a link in a chat app**. Every choice below follows
from that.

## The `<head>` recipe

The unfurl (the preview card in WhatsApp / Slack / iMessage / Twitter) is the
page's first impression, and most generated pages skip it. Include all of this:

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Trip Plan: Kyoto in 4 Days</title>
  <meta name="description" content="Day-by-day itinerary with maps and costs.">
  <meta property="og:title" content="Trip Plan: Kyoto in 4 Days">
  <meta property="og:description" content="Day-by-day itinerary with maps and costs.">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#1a1a2e">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🗺️</text></svg>">
</head>
```

Notes:

- `<title>` names the page ("Q3 Sales Recap"), it doesn't describe it
  ("A page showing sales data"). Never "Document" or "Untitled".
- `og:image` is optional (there's nowhere to host a separate image), but
  `og:title` + `og:description` alone already produce a proper preview card.

## The favicon: pick an emoji that is about the page

**Always ship one.** htmltolink injects its own brand mark into any page served
without a `<link rel="icon">`, so a page that skips it wears the platform's tab
icon instead of its own. Your one line wins, because the injection only fires
when the page has no icon of its own.

This matters more than it sounds. The tab icon is how someone finds the page
again in a row of fifteen tabs, and it is the only picture most link-shares
ever get.

The line, with the emoji swapped:

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🗺️</text></svg>">
```

**How to pick.** Name the page's subject in one noun, then pick the emoji a
person would draw for that noun. Concrete beats clever:

| The page is | Good | Not |
| --- | --- | --- |
| Kyoto trip itinerary | 🗺️ 🇯🇵 ⛩️ | ✨ (says nothing) |
| Q3 sales recap | 📈 | 📄 (every page is a document) |
| Wedding details & RSVP | 💍 💐 | ❤️ (generic) |
| Recipe for ramen | 🍜 | 🍽️ (the category, not the dish) |
| Product changelog | 🚀 📦 | 🔔 |
| Personal résumé | 👤 🧑‍💻 | 📎 |
| Party invite | 🎉 | 🥳 (face emoji read as noise at 16px) |
| D&D campaign notes | 🐉 | 🎲 |

Rules that hold up:

- **Specific over categorical.** The dish, not "food". The chart, not "document".
- **One emoji, one glyph.** Skip ZWJ sequences (👨‍👩‍👧‍👦, 🏳️‍🌈) and keycaps.
  They render inconsistently at 16px and some platforms drop them entirely.
- **Read it at 16px.** Anything with fine internal detail (🧬, 🗓️ with numbers,
  most face emoji) turns to mush. Bold silhouettes survive.
- **Match the title, not the vibe.** If the `<title>` is "Kyoto in 4 Days", 🗺️
  is right and ✨ is decoration.
- **Skin-tone and flag modifiers** are fine but rarely add anything at that size.

If the page has a real brand mark, use it instead: inline the SVG in the same
`data:` URI, or point `href` at an https URL that will stay up. Emoji is the
default because it costs one line and no request, not because it's the ceiling.

**Syntax gotchas.** The value is a URL, so:

- Quotes inside the SVG must be percent-encoded as `%22`. Unencoded `"` ends the
  HTML attribute and the icon silently vanishes.
- Keep `y=".9em"`, which sits the glyph on the baseline. Without it the emoji
  is clipped at the top of the box.
- `#` inside an inline SVG (a hex color, say) must be `%23`.
- Use `rel="icon"`. `rel="apple-touch-icon"` alone does not count as a favicon,
  and htmltolink will still inject its mark alongside it.
- `data:` icons work under the platform's strictest serve mode, so this line is
  always safe.

## Layout: mobile first, one column

Design for a ~375px-wide screen, then let it breathe on desktop:

- Wrap content in a container: `max-width: 42rem; margin: 0 auto;
  padding: 1.5rem;` (wider, ~64 to 72rem, for dashboards/tables).
- Base font size 16px minimum; line-height around 1.6 for body text.
- The page body must never scroll horizontally. Anything intrinsically wide
  (tables, code blocks, big diagrams) goes inside its own `overflow-x: auto`
  wrapper.
- Images: `max-width: 100%; height: auto;`.
- Tap targets (buttons, links acting as buttons) at least ~44px tall.

## Color and dark mode

Define colors once as custom properties and support both themes. A page opened
from a chat at night in light-blast white feels broken:

```css
:root {
  --bg: #f7f7f5; --fg: #1a1a1a; --muted: #6b7280;
  --surface: #ffffff; --line: #e6e6e2;
  --accent: #2563eb; --on-accent: #ffffff;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111114; --fg: #e7e7ea; --muted: #9ca3af;
    --surface: #1c1c21; --line: #27272d;
    --accent: #60a5fa; --on-accent: #111114;
  }
}
body { background: var(--bg); color: var(--fg); }
```

Use the tokens everywhere; never hardcode a color that only works in one theme.
`--surface` is the raised layer (cards, panels) and `--on-accent` is the label
on a solid `--accent` fill, which is why it flips to dark in the dark theme.

**No pure white or pure black where the eye rests.** `#fff` text on a dark page
glows at the edges and tires the eye; `#000` text on `#fff` is the same glare in
reverse. The page background and body text stay off-white and off-black, as in
the recipe. Tint `--bg` toward the page's subject color if it suits. `#fff` is
fine for a raised surface on the off-white page and for a label on a solid
accent, never for the page itself or for body text on dark.

**One edge per element.** A box gets a fill or a border, not both. In dark
mode, prefer the fill: a lighter `--surface` on `--bg` already lifts it. Light
lines on a dark page glow, and a row of outlined boxes side by side (chips,
tabs, cards) turns into a stack of bright parallel edges that is hard to look
at. Keep borders for lines that mean something (inputs, table rules, a
divider), and color them with `--line` only, never an invented gray or
`rgba(255,255,255,.1)`.

A page with a deliberate single look (e.g. a dark poster) may skip the media
query but must still set background and text colors explicitly, and the rules
above still apply.

## Typography

The system font stack costs zero bytes and zero requests:

```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

A Google Fonts `<link>` is fine when the page wants a distinct voice (one
family, two weights, always with a fallback stack), but it's an external
dependency; the system stack is the safe default.

## Links and controls

### New tab or same tab

Ask one question per link: will the reader want to come back to this page
after following it?

- **Yes: new tab** (`target="_blank" rel="noopener"`). References read
  alongside the page: a map pin in an itinerary, a source, a menu, a doc. On a
  one-URL page, most outbound links are this kind.
- **No: same tab.** The hand-off where the page's job ends: the RSVP form,
  "buy tickets", "open the app".
- **Never a new tab:** in-page anchors (`#day-2`), `mailto:`, `tel:`,
  downloads. `_blank` does nothing useful on these and can leave an empty tab
  behind.

### The look follows the function

The style is free. What it must do is tell the reader what will happen before
they touch anything. From the reader's side there are three functions:

- **Read only:** sections, cards, labels, tags.
- **Goes somewhere:** links.
- **Does something here:** buttons that copy, toggle, filter or expand.

Give each one its own look, distinct from the other two, and keep it the same
across the whole page. Then:

- Nothing read-only borrows an interactive cue. No hover lift, no pointer
  cursor, no button shape on a static card or label. A card that lifts on
  hover and goes nowhere is a broken promise, and a common generated-page
  tell.
- Everything interactive shows it, with a hover and focus state and a
  treatment the static parts don't use.
- A row of identical outlined boxes says nothing about what they do: tabs,
  filters, links, or labels? Pick the treatment for the job. Nav and tabs as
  text with the active item filled or underlined, filters as toggle buttons,
  labels as plain small text.
- The main call to action may be an `<a>` styled as a button ("Book a table"):
  the reader sees it as the page's main action. The look follows what the
  reader expects to happen, not the tag.

## Don't let it read as AI-generated

A shared page is judged in about two seconds. Readers now recognize the house
style of a generated page, and recognizing it costs the page its credibility
before a word gets read. The tells are specific and easy to avoid.

**In the writing:**

- **Typographic glyphs: none, anywhere.** No em dash (—), en dash (–), middle
  dot (·), ellipsis character (…) or arrow (→). Not in prose, headings,
  buttons, footers or CSS `content:` strings, and not as entities (`&mdash;`
  `&ndash;` `&middot;` `&hellip;` `&rarr;`). The em dash is the loudest tell of
  the moment, and the others travel with it. Instead:
  - An aside or a break: a comma, a full stop, a colon, or parentheses. The
    sentence usually improves.
  - A range: "9 to 5", "Mon to Fri", or a plain hyphen in tight spots
    ("2024-2026").
  - A meta line ("Oct 29, 5 min read"): commas, or separate items with
    spacing (`display: flex; gap`), never a glyph between them.
  - A link or button: the words carry it. "Read the plan", not "Read the
    plan →".

  Verbatim quotes and code samples the page displays stay as written.
- **"It's not just X, it's Y."** Same for "not only... but also". State what the
  thing is and stop.
- **Vocabulary that only appears in generated text:** delve, leverage, robust,
  seamless, elevate, unlock, harness, "in today's fast-paced world", "game
  changer", "at its core", "the landscape of". Use the plain word.
- **Everything in threes.** "Fast, simple, and reliable." Real writing has lists
  of two and lists of five.
- **The closing recap.** A final paragraph that restates the page adds nothing.
  End on the last real point.
- **"It's important to note that"** and other throat-clearing. Delete the
  preamble, keep the sentence.
- **Bold lead-ins on every bullet.** Bold the ones that carry weight. If they all
  do, none do.

**In the design:**

- **The purple-to-blue hero gradient.** `#667eea` to `#764ba2` and its neighbors
  are instantly recognizable as machine-chosen. Pick colors that come from the
  page's subject.
- **Emoji as section headings or bullet markers** (🚀 ✨ 🎯 next to every
  heading). One emoji as a favicon is useful. A grid of them is a signature.
- **Three feature cards in a row**, each with a circular icon and a two-line
  description, when the content is not actually three parallel features.
- **Uniform cards for everything.** The same rounded box with the same shadow
  around every section flattens the page's real structure. Vary the treatment,
  or drop the boxes and use whitespace.
- **Filler that survived to publication:** "Your Company Name", "Feature One",
  "Lorem ipsum", a placeholder date. Ship real content or cut the section.

The underlying rule: write and design for the specific subject in front of you.
Every item above is what a page looks like when it is assembled from a generic
template instead.

## Self-contained means self-contained

The page is published as one file with nothing next to it:

- All CSS in `<style>`, all JS in `<script>`: no `./style.css`, no `./app.js`.
- Images either from an https URL that will stay up, or embedded as `data:`
  URIs. Embedded images count toward the 10 MB cap, so keep them small
  (compress, resize; prefer SVG for graphics).
- Every external URL must be `https://`. The page is served over https and
  browsers silently block `http://` sub-resources.
- Icons: inline SVG (Lucide, see `toolkit.md`) or emoji, not an icon-font CDN.

## Interactivity: client-side only

There is no backend, but the browser is a full app runtime. What works, and
what to reach for:

- **Pages whose point is data** (reports, dashboards, comparisons, budgets,
  results): read [data.md](data.md) first.
- **Anything from another server** (a library, a font, map tiles, an embed,
  live data): take it from [toolkit.md](toolkit.md). Every tag there is pinned,
  hash-checked and tested on htmltolink. Don't pull a framework for what 30
  lines of vanilla JS can do.
- **Built-in elements before scripts:** `<details>` for sections a reader can
  fold, `<dialog>` for a detail view, the `popover` attribute for a small menu,
  `<input type="range">` with `<output>` for a what-if number, `<meter>` for a
  value within a range. Keyboard and screen-reader support come free.
- **State that persists per visitor** (a checklist, a filter, a draft):
  `localStorage`, with every read/write in `try/catch` and the page rendering
  correctly when storage is empty or unavailable.
- **Views a link can open:** when the page has tabs, filters or variants, keep
  the current one in the query string, so "look at option B" opens option B.
  The `#` stays free for section links.
  ```js
  const state = new URLSearchParams(location.search);
  function setState(key, value) {
    state.set(key, value);
    history.replaceState(null, '', '?' + state + location.hash);
    render();
  }
  const option = state.get('option') ?? 'a';
  ```
- **Copy buttons** (`navigator.clipboard.writeText`) next to anything readers
  will paste elsewhere: an address, a command, a code.
- **Print:** plans and reports get saved as PDF. Give them print styles:
  ```css
  @media print {
    nav, button, .no-print { display: none !important; }
    section, figure, table, .chart { break-inside: avoid; }
  }
  ```
- **Motion that stops:** a transition answers a click and ends. Nothing loops
  (pulses, shimmers, spinners), and transitions sit inside
  `@media (prefers-reduced-motion: no-preference)`.
- The page still shows its content if a CDN fails: text, headline numbers and
  tables come from the HTML itself or from inline script reading the page's
  own data, never from a library. Libraries add charts and interaction on top.

**What the platform cannot do.** Design around these, don't ship them broken:

- No form submissions: there is no server to receive a `POST`. If the user
  wants to "collect" something, use a `mailto:` link, a copy-to-clipboard
  button, or link to a real form service, and say which you chose.
- No multi-page navigation: it's one URL. Use in-page sections with anchor
  links, or tabs toggled by JS.
- No shared or server state: nothing one visitor does is visible to another.
  Don't build a poll or counter that pretends otherwise.
- No secrets: everything in the file is public, including anything in the JS.
- No background threads (Web Workers): libraries that need one break. Every
  pick in `toolkit.md` works without.

## Accessibility floor

- One `<h1>`, headings in order, semantic elements (`<nav>`, `<main>`,
  `<button>` for actions, not clickable `<div>`s).
- `alt` text on meaningful images; `alt=""` on decorative ones.
- Text contrast ≥ 4.5:1 against its background in both themes.
- Visible focus states; don't `outline: none` without a replacement.

## Before you publish

Run the pre-publish checklist in SKILL.md. Then reread the page top to bottom
once as a stranger on a phone: does the first screen say what this is and why
you'd scroll?
