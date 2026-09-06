# Scale of Wealth

An unchanged copy of [Wealth, shown to scale](https://eattherichtextformat.github.io/1-pixel-wealth/).

## Source and license

The files in `public/` are copied byte-for-byte from
[`eattherichtextformat/1-pixel-wealth`](https://github.com/eattherichtextformat/1-pixel-wealth)
at published `gh-pages` commit `774183b6bc9193757b3d8d957f359fa61b1e71c0`, including its German translation,
images, styles, scripts, metadata, and original analytics configuration. The original
files were also checked against the published reference site.

Original project by [Matt Korostoff](https://github.com/mkorostoff/1-pixel-wealth),
with the changes and translations in the referenced fork. The original GNU GPL v3
license is retained at [`public/LICENSE.txt`](public/LICENSE.txt). No upstream
content or behavior has been changed, and the historical figures are not updated.

## Deployment

Vercel serves `public/` directly. `vercel.json` selects the static-site preset,
disables dependency installation and compilation, and sets the output directory.
Pushing to `main` triggers the connected Vercel production deployment.

## Local preview

Run `python3 -m http.server 8000 --directory public`, then open
`http://localhost:8000/`.
