# Presenting data

Read this when the page's point is data: a report, a dashboard, a comparison, a
budget, results. A page that only mentions a date or a price doesn't need it.
A chart that is just a picture wastes what a web page can do.
Readers should be able to hover a point, sort a column, filter a view, open the
numbers as a table and send a link to exactly what they are looking at.

Libraries and their tags are in `toolkit.md`.

## Lead with the answer

The first screen states the finding in words and one number: "Wholesale grew
18% in Q3, to $412,000." Charts underneath support it. A page of charts with
no sentence makes every reader do the analysis.

## Pick the form before the chart

| The data says | Use |
| --- | --- |
| One number that matters | A big number, with its comparison ("up 8% on June") |
| A handful of numbers | A small table, or bars made of `<div>`s |
| Change over time | Line chart (bars if there are under ~8 periods) |
| Compare categories | Horizontal bars, sorted by value |
| Parts of a whole | One stacked bar; a donut only for 2 to 4 parts |
| Spread of values | Histogram or dot plot |
| Two measures together | Scatter plot |
| Values by place | Map, only when location is the point; otherwise bars |
| Exact values to look up | Table |

Not every number needs a chart. Small visuals need no library: a sparkline is
an inline `<svg>` polyline, a bar is a `<div>` with a percentage width. Reach
for ECharts when a chart needs axes, tooltips, zoom or a map.

## Keep the data in one place

Put the data in the page once, as numbers, and build every chart, table and
headline number from it:

```html
<script type="application/json" id="data">
{"months": ["Jul", "Aug", "Sep"], "channels": [{"name": "Web", "revenue": [41200, 45800, 52300]}]}
</script>
<script>
const data = JSON.parse(document.getElementById('data').textContent);
</script>
```

Updating the page then means replacing one block, and charts can never
disagree with the table next to them. Format only at display time:

```js
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact' });
const pct = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
```

Say what the numbers are and when: units in every label, and an "as of" date
near the top.

## Charts people can trust

- Bars start at zero.
- Sort bars by value, unless the order means something (months, steps).
- One y-axis per chart. Two measures on different scales get two charts.
- Up to four lines: label each line at its end instead of a far-away legend.
- To make a point, color the series that matters and gray the rest.
- No 3D, no pie with more than four slices.

## Color

- **Categories:** this order, never shuffled, never by rank. It stays readable
  with color blindness (Okabe and Ito). Past five series, fold the rest into
  "Other" in gray.
  `#0072B2` blue, `#E69F00` orange, `#009E73` green, `#D55E00` vermillion,
  `#56B4E9` sky.
- **Amounts** (heat maps, data maps): one hue from light to dark.
- **Above and below a middle value:** two hues with a neutral middle.
- Color is never the only signal: labels, tooltips and the table carry it too.
- Text stays in the page's text colors, not the series color.

## Every chart is interactive

- A tooltip on hover and on tap.
- A table view of the same numbers right under the chart, in
  `<details><summary>Show as table</summary><table>...</table></details>` so
  it opens without a script.
- Filters as one row of toggle buttons above the charts, never a dropdown per
  chart. The current filter goes in the query string so a shared link opens
  the same view (snippet in `authoring.md`, "Views a link can open").
- On phones: full width, at least 240px tall, fewer axis labels, horizontal bars
  when labels are long.

## The ECharts recipe

This helper gives every chart the shared settings: the right theme for light
or dark mode (and a redraw when it changes), redraw on resize, tooltips that
stay on screen, the category colors, and a text description for screen
readers.

```js
const dark = matchMedia('(prefers-color-scheme: dark)');
const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const PALETTE = ['#0072B2', '#E69F00', '#009E73', '#D55E00', '#56B4E9'];
const redraws = [];

function chart(el, build) {
  let c;
  const draw = () => {
    echarts.dispose(el);
    c = echarts.init(el, dark.matches ? 'dark' : null, { renderer: 'svg' });
    c.setOption({
      backgroundColor: 'transparent',
      color: PALETTE,
      aria: { enabled: true },
      textStyle: { fontFamily: getComputedStyle(document.body).fontFamily },
      tooltip: { confine: true },
    });
    c.setOption(build());
  };
  draw();
  new ResizeObserver(() => c.resize()).observe(el);
  redraws.push(draw);
}
dark.addEventListener('change', () => redraws.forEach((draw) => draw()));

chart(document.getElementById('revenue'), () => ({
  tooltip: { trigger: 'axis', valueFormatter: (v) => money.format(v) },
  legend: { bottom: 0 },
  xAxis: { type: 'category', data: data.months },
  yAxis: { type: 'value', axisLabel: { formatter: (v) => compact.format(v) } },
  series: data.channels.map((ch) => ({ name: ch.name, type: 'line', data: ch.revenue })),
}));
```

Give each chart element a height in CSS (`.chart { height: 320px; }`) and a
heading above it that says what it shows. Horizontal bars with long category
names need `grid: { left: 16, containLabel: true }`, or ECharts clips the
first letters of the labels.

Data map, with ECharts' full build and the shapes registered as in
`toolkit.md` (inside the same `<script type="module">`). `--seq-low` and `--seq-high` are two page color
tokens, light and dark ends of one hue, redefined for dark mode:

```js
chart(document.getElementById('by-country'), () => ({
  tooltip: { trigger: 'item', valueFormatter: (v) => (v == null ? 'No data' : money.format(v)) },
  visualMap: { min: 0, max: 120000, calculable: true, left: 0, bottom: 0,
    formatter: (v) => compact.format(v),
    inRange: { color: [token('--seq-low'), token('--seq-high')] } },
  series: [{ type: 'map', map: 'world', roam: true,
    data: data.countries.map((d) => ({ name: d.name, value: d.revenue })) }],
}));
```

A name that doesn't match a shape is dropped without a warning, so check before
drawing: this list must be empty.

```js
data.countries.filter((d) => !countries.features.some((f) => f.properties.name === d.name))
```

The shapes use their own names ("United States of America", not "United
States"). The light 110m shapes leave out small countries such as Singapore;
when one matters, load the 50m shapes from `toolkit.md`, or use bars.

## Tables

- Numbers right-aligned with `font-variant-numeric: tabular-nums`.
- The header row stays visible while scrolling
  (`th { position: sticky; top: 0; }` inside a scroll container).
- Click a header to sort. Put a button in each `<th>` and the raw value in
  `data-value` when the cell shows a formatted one. Style the buttons to look
  like the header text (`font: inherit; color: inherit; background: none;
  border: 0; padding: 0; cursor: pointer`) and keep their focus outline:

```js
for (const table of document.querySelectorAll('table[data-sortable]')) {
  const heads = [...table.tHead.rows[0].cells];
  heads.forEach((th, col) => th.querySelector('button').addEventListener('click', () => {
    const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    heads.forEach((h) => h.setAttribute('aria-sort', 'none'));
    th.setAttribute('aria-sort', dir);
    const value = (row) => row.cells[col].dataset.value ?? row.cells[col].textContent.trim();
    const rows = [...table.tBodies[0].rows];
    const numeric = rows.every((r) => value(r) !== '' && !isNaN(value(r)));
    rows.sort((a, b) => (numeric ? value(a) - value(b) : value(a).localeCompare(value(b))) * (dir === 'ascending' ? 1 : -1));
    table.tBodies[0].append(...rows);
  }));
}
```

Over ~300 rows, use Tabulator from `toolkit.md`.

## Let readers take the numbers

A "Download CSV" button costs a few lines and saves readers retyping:

```js
function downloadCsv(rows, filename) {
  const cols = Object.keys(rows[0]);
  const cell = (v) => (/[",\n]/.test(String(v)) ? '"' + String(v).replaceAll('"', '""') + '"' : v);
  const csv = [cols, ...rows.map((r) => cols.map((c) => r[c]))].map((r) => r.map(cell).join(',')).join('\n');
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: filename,
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
```

Reports get printed and saved as PDF: add the print styles from
`authoring.md`, and keep each chart and table from splitting across pages.
