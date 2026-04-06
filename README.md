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

### Removed upstream features
- `languages.html` per-language voice picker (replaced by the inline language filter + favorites)
- `preferredVoices` storage key (superseded by `favoriteVoices`)

---

## Loading in Firefox (development)

1. Uninstall the AMO version if installed
2. Go to `about:debugging` → This Firefox → Load Temporary Add-on
3. Select `manifest.json` from this repo
