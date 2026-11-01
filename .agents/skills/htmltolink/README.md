# htmltolink skill

Publish an HTML file and get a public link, from inside your AI coding agent.

When you (or your agent) have a self-contained HTML file and want to share it,
this skill tells the agent to publish it to [htmltolink.com](https://htmltolink.com)
and hand you back a public link plus a private manage link. No account, no signup.

## Install

```sh
npx skills add vineiron/htmltolink-skill
```

Works with Claude Code, Cursor, Codex, Copilot, and other agents supported by the
[skills CLI](https://skills.sh).

## Use

Just ask your agent to share the page, in your own words:

> "share this HTML file"
> "put this page online and give me a link"
> "make this a link I can send to someone"

The agent publishes it and shows you:

- **Public link**: share with anyone (`something.htmltolink.site`).
- **Manage link**: keep private; update or delete the page from it.

You can also ask it to build the page in the same breath:

> "make me a page for my trip itinerary and give me a link"

When the agent generates the HTML itself, the skill's
[authoring guide](./references/authoring.md) kicks in: link-preview (Open
Graph) tags, mobile-first layout, dark mode, a favicon emoji picked to match the
page, a pass to strip the tells that make a page read as AI-generated, and
honest guidance on what a single static file can and can't do. Files you hand it
are published as-is, never silently restyled.

Pages whose point is data (reports, dashboards, comparisons, budgets, results)
also get the [data guide](./references/data.md): charts with tooltips and a
table view, sortable tables, maps, and links that open a filtered view. Anything loaded from another server comes from the
[toolkit](./references/toolkit.md): libraries pinned to exact versions with
integrity hashes, each tested under htmltolink's serving headers.

## How it works

The skill is a single `curl` against htmltolink's public API:

```sh
curl -sS -X POST https://htmltolink.com/v1/pages \
  -H 'Content-Type: text/html' --data-binary @index.html
```

Everything is auditable in [`SKILL.md`](./SKILL.md): no hidden network calls, no
credentials. One self-contained HTML file per page; anonymous uploads up to 10 MB,
25 MB with an API key or from the website.

## With an account

Keys are optional, and publishing never needs one. If you have a key from
[your keys page](https://htmltolink.com/dashboard/keys), paste it into the chat
when you ask:

> "publish this page with my htmltolink key htk_..."

The agent uses it for that conversation and your pages land on your dashboard
already yours, with no claim step. The skill never writes the key anywhere: not
to a file, not to your shell, not to the agent's memory. Name the key after
wherever you use it, a laptop or a CI job, so you can revoke the right one
later.

## Links

- Website: https://htmltolink.com
- Terms: https://htmltolink.com/terms · Privacy: https://htmltolink.com/privacy

## License

MIT
