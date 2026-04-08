# Release checklist

1. Make changes, commit
2. Bump version in `manifest.json` and `updates.json` (must match, e.g. `2.22.1`)
3. `bash tools/build.sh` → produces `../read-aloud-fork.zip`
4. Submit zip to https://addons.mozilla.org/de/developers/addon/read-aloud-fork-le/versions/submit/
5. Download the signed `.xpi` from the AMO developer page
6. Create GitHub Release tagged `v<version>`, upload the signed XPI as `read-aloud-fork.xpi`
7. Commit & push `manifest.json` + `updates.json` so existing users auto-update

## Notes
- AMO is unlisted — signed but not publicly searchable
- `updates.json` is fetched by Firefox to detect new versions; the `update_link` must point to the signed XPI on GitHub Releases
- `update_url` in `manifest.json` points to the raw GitHub URL of `updates.json`:
  `https://raw.githubusercontent.com/luc42ei/read-aloud/master/updates.json`
- Do not include `updates.json` in the zip (already excluded in `build.sh`)
