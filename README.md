# phantom-editor-site

The landing page for [Phantom Editor](https://github.com/hassanaziz0012/phantom-editor), live at [phantom.hassandev.me](https://phantom.hassandev.me).

Plain HTML, CSS and JavaScript, with no dependencies. The content (pipeline stages, command list, videos) lives in `build.mjs`, which writes `index.html`:

```bash
node build.mjs            # regenerate index.html after editing content
python3 -m http.server    # preview at http://localhost:8000
```

`index.html` is committed, so Vercel serves the folder as it is, with no build step.

The clips in `assets/broll/` were rendered with `phantom broll clip`, and the thumbnails in `assets/thumbs/` are from the videos the page links to.
