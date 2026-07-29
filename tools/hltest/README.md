# hl_probe — headless probe for the in-page highlight

Replays a full "playback" over a real page without a browser extension, TTS or a
human, and reports what the two highlight layers actually did. Removes the
copy-the-browser-console loop when debugging highlight/chunking bugs.

## How it works

Chromium (Playwright) loads the page, then the real content scripts are injected
into it — `jquery`, `js/sentence-splitter.js`, `js/content/html-doc.js`,
`js/content/hover-overlay.js` — on top of a stub that fakes the only extension
surface they use (`brapi.storage` → `showHighlighting=3`, `brapi.runtime
.sendMessage('getPlaybackState')` → a state the probe controls). The text
breakers are lifted out of `js/speech.js` at runtime, so chunk boundaries,
`originalTextIndex` and `chunkStart` match real playback (CharBreaker(200), i.e.
the cloud/Google-Translate path).

Then, per chunk: publish the fake playback state, call
`readAloudDoc.highlightBlock(originalTextIndex)` exactly as `player.js` does,
wait one overlay poll, and measure.

## Usage

```sh
python3 tools/hltest/hl_probe.py https://example.com/article        # full page
python3 tools/hltest/hl_probe.py <url> --max 45                    # first 45 chunks
python3 tools/hltest/hl_probe.py <url> --json out.json              # machine-readable
python3 tools/hltest/hl_probe.py <url> --htmldoc /tmp/html-doc.base.js   # A/B a baseline
python3 tools/hltest/hl_probe.py <url> --browser chromium           # cross-check
python3 tools/hltest/hl_probe.py <url> --headed                     # watch it
```

**Firefox is the default and the verdict** — this ships as a Firefox add-on, and
layout/`innerText`/rect behaviour differs enough to matter: two jump-to-the-top
bugs (v3.0.11) reproduced only in Gecko and looked perfectly clean in Chromium.
Use `--browser chromium` only to cross-check whether a bug is engine-specific.

Needs the `playwright` Python package with the matching browser build
(`python3 -m playwright install firefox`).
`git show HEAD:js/content/html-doc.js > /tmp/html-doc.base.js` + `--htmldoc`
gives a before/after comparison on the same page.

Per chunk it prints the blue box (tag, height, text length), the number of amber
sentence rects, `window.scrollY`, and flags: `NO-BOX`, `MULTI-BOX`, `HUGE-BOX`,
`SCROLL-BACK`, `NO-AMBER`. `page.on('console')` output is printed too, so
`[RA-DBG]` logs land straight in the terminal.

## Working with it

Run the **baseline first** (`git stash` or `--htmldoc` with the committed file),
then the fix, and compare counts over the whole page — not single rows. The
numbers that matter: chunks without a blue box, chunks without an amber
highlight, and backwards box jumps (`boxTop` decreasing while the chunk index
advances). Single rows are noisy; the totals are not.

When something scrolls and you don't know who did it, inject a spy before the
content scripts that wraps `window.scrollTo`, `window.scroll` and
`Element.prototype.scrollIntoView` and records `new Error().stack` — that is how
the v3.0.11 jumps were traced to `applyPlaybackHighlight`.

Two measurement caveats:

- `SCROLL-BACK` also fires on pages that reflow while loading. The reliable
  backwards-jump signal is `boxTop` in the JSON (box position in document
  coordinates) decreasing while the chunk index advances.
- `NO-AMBER` is often just the 300 ms overlay poll not having run yet. Below
  ~800 ms per chunk (`--wait`) the miss count is noise, not a bug.
