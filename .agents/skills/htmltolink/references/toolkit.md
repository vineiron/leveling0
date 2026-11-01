# Toolkit: outside code that is safe and works on htmltolink

Read this before a page loads anything from another server: a library, a
stylesheet, a font, map tiles, an embed or live data. Everything listed here was
loaded and run under the same headers htmltolink serves pages with. Use these
tags as-is.

Snippets that use `await` sit in `<script type="module">`; a plain `<script>`
can't use `await` at the top level. Module scripts run after the plain ones,
so the libraries above them are already loaded.

## Rules for anything external

1. **One CDN: jsDelivr** (`https://cdn.jsdelivr.net/npm/`). It serves every npm
   package, a published version never changes, and it runs on more than one
   network. Not unpkg (one origin, repeated outages), not esm.sh (rewrites code
   on the fly), not a library's own website.
2. **Exact versions only.** `echarts@6.1.0`, never `echarts`, `echarts@6` or
   `@latest`.
3. **Every `<script>` and stylesheet carries `integrity` and
   `crossorigin="anonymous"`.** If the file is ever changed on the CDN, the
   browser refuses it. Copy the tags below. For a file not listed here:
   ```sh
   echo "sha384-$(curl -sL URL | openssl dgst -sha384 -binary | openssl base64 -A)"
   ```
4. **Single-file builds** (`.min.js`). ES module builds that import more files
   at runtime load those extra files without an integrity check.
5. **Permissive licenses only:** MIT, BSD, ISC, Apache-2.0, OFL for fonts. Not
   Highcharts or amCharts (paid), not ApexCharts 5 and later (paid above $2M
   revenue).
6. **No tracking.** No analytics, ad, chat-widget or social "share" scripts.
   The people opening the link never agreed to them.
7. **Load only what the page uses.** ECharts is 234 KB and Mermaid 750 KB
   (gzipped); a page with three numbers needs neither.
8. **The page still makes its point if the CDN is down.** Headline numbers and
   text live in the HTML; libraries add charts and interaction on top.

## Picks

| Job | Pick | Size (gzip) |
| --- | --- | --- |
| Charts | ECharts 6.1.0, common build | 234 KB |
| Data maps, heatmaps, Sankey, treemaps | ECharts 6.1.0, full build | 360 KB |
| Tables over ~300 rows | Tabulator 6.6.1 | 100 KB |
| A place or route on a map | Leaflet 1.9.4 + OpenStreetMap tiles | 40 KB |
| Country or state shapes for data maps | topojson-client 3.1.0 + world-atlas / us-atlas | 2 KB + 40 KB |
| Diagrams with automatic layout | Mermaid tiny 12.2.0 | 750 KB |
| Math | KaTeX 0.19.0 | 75 KB |
| Code with highlighting | highlight.js 11.12.0 | 40 KB |
| SQL the reader types | sql.js 1.14.2 (SQLite) | 330 KB |
| A CSV the reader drops in | Papa Parse 5.7.0 | 20 KB |
| A typeface | Fontsource on jsDelivr | per font |
| Icons | Lucide SVG, pasted inline | 0 |

Small visuals need no library: a big number, a few bars made of `<div>`s, a
sparkline as an inline `<svg>` polyline. See `data.md`.

### ECharts (charts, data maps)

The common build covers line, bar, scatter and pie charts with tooltips, legend,
zoom, mark lines and screen-reader text:

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.common.min.js" integrity="sha384-Eocxm0VcwHzkU/WL/hiZUvWxg2ISrOO+xcgznp2yXB0nAUIgQUk+GcTHQ+v62nj9" crossorigin="anonymous"></script>
```

Data maps, heatmaps, Sankey, treemaps, funnels, gauges and color scales
(`visualMap`) need the full build instead. The common build skips those chart
types without an error, so a chart that stays blank is the sign:

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js" integrity="sha384-C2iskrW/uPW46KzOjrvJIQo4YkV8lkD+QS0CrDN18IIPIpT/g2USu8bTP3nvmIAD" crossorigin="anonymous"></script>
```

The chart recipe (theme, resize, tooltips, accessibility) is in `data.md`.

### Tabulator (big tables)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tabulator-tables@6.6.1/dist/css/tabulator_site.min.css" media="(prefers-color-scheme: light)" integrity="sha384-APxOG/5rW8TDzHasRfnhZoe7pZLpWdDt29Np1UkbBCRvApVCX+Pa7LBm7PlVIe3D" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tabulator-tables@6.6.1/dist/css/tabulator_site_dark.min.css" media="(prefers-color-scheme: dark)" integrity="sha384-iA73RGLJyzm2oq98sqiz7KhBhJ1d6Yq/4FSunzwNucinbBZPQC/wOTlB9+EebNbb" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/tabulator-tables@6.6.1/dist/js/tabulator.min.js" integrity="sha384-G2ks3Wc8ERwZQbUnD+D54IZmFUlgMENIYP7tgDtz5ANc7yNyu+z0+4qn7Iit8jsH" crossorigin="anonymous"></script>
<script>
const table = new Tabulator('#orders', {
  data: rows, height: 420, layout: 'fitColumns',
  columns: [
    { title: 'Customer', field: 'customer', headerFilter: 'input' },
    { title: 'Revenue', field: 'revenue', sorter: 'number', hozAlign: 'right' },
  ],
});
// A "Download CSV" button: table.download('csv', 'orders.csv');
</script>
```

Below ~300 rows, a plain `<table>` with the sort snippet in `data.md` is
lighter and matches the page's own styles.

### Leaflet (a place or a route)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" integrity="sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js" integrity="sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH" crossorigin="anonymous"></script>
<script>
const map = L.map('map', { scrollWheelZoom: false }).setView([35.0116, 135.7681], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  referrerPolicy: 'strict-origin-when-cross-origin',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
L.marker([35.0116, 135.7681]).addTo(map).bindPopup('Kyoto Station');
</script>
```

- Keep the attribution: OpenStreetMap's tile policy requires it.
- Keep `referrerPolicy`: htmltolink sends no referrer, and the tile policy asks
  for one. This sends it for tiles only.
- `scrollWheelZoom: false` stops the map from catching the page's scroll.
- Give the map element a height in CSS (e.g. `height: 360px`).

### Country and state shapes (data maps)

```html
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js" integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67" crossorigin="anonymous"></script>
<script type="module">
const world = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json', {
  integrity: 'sha384-yOCJ+8ShBm8UDqtAVtAvxTDDf4gXo5edxl/YG0FmVC5OTmqVLl7utuVGBDEeZWHf',
})).json();
const countries = topojson.feature(world, world.objects.countries);
countries.features = countries.features.filter((f) => f.properties.name !== 'Antarctica');
for (const f of countries.features) {
  const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const ring of polygons.flat()) {
    if (ring.some(([x]) => x > 160) && ring.some(([x]) => x < -160)) for (const p of ring) if (p[0] < 0) p[0] += 360;
  }
}
echarts.registerMap('world', countries);
</script>
```

The loop keeps Russia and Fiji whole: without it, shapes that cross the 180°
line draw stripes across the map.

With small countries (Singapore, Bahrain): `world-atlas@2.0.2/countries-50m.json`
(230 KB instead of 40 KB), integrity
`sha384-Aw4s9pX1PTPntIYkZ/qV9IYiF5Gv8eTl6Dd/TT56zfO1Wwd+owFwYUuuXNUMrWkc`.
US states: `us-atlas@3.0.1/states-10m.json`, integrity
`sha384-s0hsN5kwP4LMWbFcTPSZT8Ev6nktHrbEYdPQngLCYA33Qhjk2wtqH5yIEu06AXMY`,
object `states`. Region names match `properties.name` ("Japan", "United States
of America", "California"). The map recipe is in `data.md`.

### Mermaid (diagrams that lay themselves out)

```html
<script src="https://cdn.jsdelivr.net/npm/@mermaid-js/tiny@12.2.0/dist/mermaid.tiny.js" integrity="sha384-QCupLuRUDJe+dQ24RHpme+E1f5hpLkiB3P6YhujXLqc2Inrj/C+GgF8bgTuSXCiE" crossorigin="anonymous"></script>
<pre class="mermaid">
flowchart LR
  Draft --> Review --> Ship
</pre>
<script>
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'neutral',
});
mermaid.run();
</script>
```

Use it for flowcharts, sequence diagrams and Gantt charts with more than a few
boxes. The tiny build draws every Mermaid diagram except mindmaps and
architecture diagrams, and no math in labels; for a mindmap, use nested lists. A timeline or three to five steps is better as HTML and CSS: no 750 KB
download, and it follows the page's own type and colors.

### KaTeX (math)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/katex.min.css" integrity="sha384-3rdsX6e5mueWyoweR9NIVmtEsUkokpBT/0ALqKKIBMr9j4qhHkaIkAcGgsE6uVlp" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/katex.min.js" integrity="sha384-QFFtAGzvvj+bfgCGxXJlNZZR1nXEZgvG8tDLCCY1F19xl20WlfTYgguB4VcNdxYk" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/contrib/auto-render.min.js" integrity="sha384-bjyGPfbij8/NDKJhSGZNP/khQVgtHUE5exjm4Ydllo42FwIgYsdLO2lXGmRBf5Mz" crossorigin="anonymous"></script>
<script>renderMathInElement(document.body);</script>
```

Write math as `\( inline \)` or `$$ display $$`.

### highlight.js (code)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.12.0/styles/github.min.css" media="(prefers-color-scheme: light)" integrity="sha384-eFTL69TLRZTkNfYZOLM+G04821K1qZao/4QLJbet1pP4tcF+fdXq/9CdqAbWRl/L" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.12.0/styles/github-dark.min.css" media="(prefers-color-scheme: dark)" integrity="sha384-wH75j6z1lH97ZOpMOInqhgKzFkAInZPPSPlZpYKYTOqsaizPvhQZmAtLcPKXpLyH" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.12.0/highlight.min.js" integrity="sha384-wjfDDhOPPdjtva8vWBhWeVprSpmxisEu5aYT3q1JyACqXpdKpo3PWZTMVq24MBix" crossorigin="anonymous"></script>
<script>hljs.highlightAll();</script>
```

Mark blocks as `<pre><code class="language-js">`. Long lines scroll inside the
block (`overflow-x: auto`), never the page.

### sql.js (SQL the reader types)

```html
<script src="https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.js" integrity="sha384-7Zym2PlgXfg8ap8cqJUwlZrLl+VEwt0NVbzYfhH28IWLnSpAgQOnSCY2+EXo5MtM" crossorigin="anonymous"></script>
<script type="module">
const wasm = await fetch('https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.wasm', {
  integrity: 'sha384-x0YkuPkDHnKTZcB1JO4eb6j5+eU36aka+jBA6tOKTFaTz98b9V7fPT0QgZ9qyQW2',
});
const SQL = await initSqlJs({ wasmBinary: await wasm.arrayBuffer() });
const db = new SQL.Database();
db.run('CREATE TABLE orders (region TEXT, total REAL)');
const insert = db.prepare('INSERT INTO orders VALUES (?, ?)');
for (const r of data.orders) insert.run([r.region, r.total]);
const [result] = db.exec(readerQuery); // result.columns, result.values
</script>
```

The `.wasm` file is fetched with its own integrity hash, like the script. Only
for pages where readers ask their own questions. To compute totals for charts,
plain JavaScript (`reduce`, `Map`) is enough.

### Papa Parse (a CSV the reader drops in)

```html
<script src="https://cdn.jsdelivr.net/npm/papaparse@5.7.0/papaparse.min.js" integrity="sha384-Cac1u6+UwTX6dLDygwZYoxzTmqBikf22tn1qbNy+EVRSvn+FIh9oC/VRmAaL4Ih9" crossorigin="anonymous"></script>
<script>
Papa.parse(file, { header: true, dynamicTyping: true, skipEmptyLines: true, complete: (r) => render(r.data) });
</script>
```

`file` comes from `<input type="file" accept=".csv">` or a drop event. The file
never leaves the reader's device; say so on the page. Don't pass
`worker: true`: htmltolink blocks background threads.

### A typeface

The system stack in `authoring.md` is the default. When the page needs a
distinct voice, load one family from Fontsource, on the same CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5.3.0/index.css" integrity="sha384-ZTIcl2CmY0wyM9ANOhomBco7rEUIlWztf6lGcLKCocKUrIgGCsfisuZyE+hadW8K" crossorigin="anonymous">
```

Then `font-family: "Inter Variable", system-ui, sans-serif;`. Other families
follow the pattern `@fontsource-variable/<name>@<version>/index.css`; compute the
integrity as in rule 3.

### Icons

Paste the SVG inline: no script, no request. Fetch one from Lucide (ISC):

```sh
curl -s https://cdn.jsdelivr.net/npm/lucide-static@1.57.0/icons/map-pin.svg
```

Then set `stroke="currentColor"` so it follows the text color in both themes.

## Embeds (video, design files, slides)

htmltolink sends no referrer, and some players refuse to play without one:
a plain YouTube embed shows "Error 153" on htmltolink. Give every embed iframe
these attributes:

```html
<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
  title="What the video is"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
  style="width: 100%; aspect-ratio: 16 / 9; border: 0"></iframe>
```

- YouTube: `youtube-nocookie.com`, the privacy-enhanced domain.
- Vimeo, Loom, Figma, Google Slides, CodePen: the service's own embed URL, same
  attributes.
- Embed only what the user asked for.

## Live data

Calling a public API works when it needs no key, is served over https and
allows cross-origin requests. Show when the data is from ("as of 14:05"), and
keep a snapshot in the page's data block to fall back on when the call fails.
Never put an API key in a page: everything in it is public.

## Not on the list, and why

- **MapLibre GL, Mapbox GL, DuckDB-wasm, Perspective:** they need background
  threads (Web Workers), which htmltolink blocks. Maps draw without streets or
  labels; the others fail to start.
- **Chart.js, Observable Plot, Vega-Lite:** good libraries, but ECharts draws the
  same charts and adds zoom, legend toggles, maps, dark-theme switching and
  screen-reader text. One library keeps every page consistent.
- **ECharts' simple build:** smaller, but it can't draw SVG and crashes on chart
  types it doesn't include.
- **Plotly:** 1.3 MB gzipped, too heavy for a link opened on a phone.
- **Tailwind's Play CDN:** Tailwind says it is for development, not for
  published pages.
- **CARTO and other keyed tile servers:** they now require an API key.
