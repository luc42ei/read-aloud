# Read Aloud — Personal Fork

Fork of [ken107/read-aloud](https://github.com/ken107/read-aloud), optimized for Firefox with a focus on a cleaner settings UI and better voice management.

See the original repo for general documentation, architecture, and API key setup.

---

## Changes from upstream

### Firefox compatibility
- Background page uses `scripts` array instead of `service_worker` (MV3 Firefox requirement)

### Settings UI overhaul
- **Voice filter chips** — clickable chips per provider/model family (Google Neural2, Google Chirp3-HD, etc.) instead of typing; one chip per family, not per language accent
- **Favorites** — star button next to the voice dropdown; starred voices appear in a gold "★ Favorites" chip that filters the dropdown to just your picks
- **Language picker** (`Sprache`) — inline checkbox dropdown above the voice selector, no separate tab
- **Highlighting** — three-button segmented control (Popup / Window / Off) instead of a dropdown
- **Speed slider** shows live value while dragging; edit button switches to a manual number input
- **Removed** pitch and volume controls (volume is set at OS level; pitch is rarely useful)
- **Removed** native browser voices (espeak etc.) from the dropdown — poor quality
- **Removed** empty optgroup separators from the voice dropdown
- **Removed** static shortcut keys section (doesn't reflect user-customized shortcuts)
- Custom voices (Amazon Polly, Google Wavenet, IBM Watson, Azure, OpenAI) embedded as collapsible sections inline — no separate tab
- Voice dropdown only shows voices that will actually work (hides Amazon Polly without AWS keys, etc.)
- Right-click extension icon → **Open settings** context menu
- Increased row spacing in the settings grid

### Playback behavior
- Changing settings (rate, voice, etc.) no longer stops playback — the player re-reads settings per sentence, so changes take effect at the next sentence boundary
- Rate change via keyboard shortcut applies mid-playback (was broken for auto-select due to key mismatch)

### Speed shortcuts
Two new commands (assign keys in `about:addons → Manage Extension Shortcuts`):
- **Speed up** (`rate-up`): +0.05×
- **Slow down** (`rate-down`): −0.05×

Rate changes apply at the next sentence boundary without interrupting playback.

### Auto-select voice
When no specific voice is selected, the auto-select priority order is:

1. **Favorited voice matching the page language** — whichever matching favorite you starred first wins
2. Piper (offline)
3. Google Translate
4. Other non-espeak voices
5. Espeak (last resort)

The currently auto-selected voice is shown as `Auto: <voice name>` below the dropdown.

To control which voice is picked for a language: star voices in your preferred order. The first favorited voice that supports the page language is used. To change priority, unfavorite and re-favorite in the desired order.

### Text extraction improvements
- Better block detection for rich-text editors (Draft.js, X/Twitter): span-only paragraphs without block-level children are now recognized as text blocks
- Short `<p>` and bold-styled elements treated as pseudo-headings for correct reading order

### Supertonic TTS (offline, on-device)
- Bundled Supertonic TTS engine running entirely in-browser via ONNX Runtime Web (WASM backend) in a Web Worker — no external service
- Models (~250 MB) downloaded on demand from HuggingFace and cached in the browser Cache API (persistent, not subject to cache eviction)
- **Install:** select "Supertonic Stimmen installieren…" in the voice dropdown; progress is shown inline; the 10 voices (F1–F5, M1–M5) appear only after download completes
- Models are loaded from cache into the Worker on first use per session; subsequent sentences in the same session are instant
- Supports en / ko / es / pt / fr
- Dash-between-phrases is normalized to a comma before inference for more natural pausing

### In-page highlighting
New **In Page** option in the highlighting control (alongside Popup / Window / Off):
- Highlights the currently-read block directly on the webpage with a semi-transparent blue outline
- Uses element-level highlighting for pages with `<p>` tags; falls back to precise range-based highlighting for flat HTML (e.g. `<br><br>`-separated text)
- Handles inline elements (footnotes, links, bold) within a highlighted range without wrapping the whole page
- Highlighted block scrolls to 25% from the top of the viewport
- **Click any block to seek** — while "In Page" mode is active, all readable blocks are clickable; clicking seeks TTS to that block (including click-position detection within single-container pages)
- Highlighting is driven by the player (persists after popup is closed)

### Removed upstream features
- `languages.html` per-language voice picker (replaced by the inline language filter + favorites)
- `preferredVoices` storage key (superseded by `favoriteVoices`)
- Remote announcements banner in popup

---

## Loading in Firefox (development)

1. Uninstall the AMO version if installed
2. Go to `about:debugging` → This Firefox → Load Temporary Add-on
3. Select `manifest.json` from this repo
