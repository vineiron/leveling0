<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

- i love to build. i focus on building complex things as simple as possible. i love to find ways to reduce complexity when solving problems.
- try to look at skills we have, cause maybe there are some skills that could be use.
- if things related to package.json, like maybe adding/install pacakge, give me the command(s), it should run by myself manually.
- when do research / deep dive on options, i think in the end, tell what the most likely best for the cases and give reasonings why, for the options that not the best, give reasonings also why it not the best.
- when asked about git commit message, start with this kind of style, you can try to give the best practice one, also:
```
feat/fix/chore/refactor(member > disbursements): enhance /member/disbursements page

- add back button
- use card component on items
```
- when asked about pull request description, start with this kind of style, you can try to give the best practice one, also:
```
  Articles Management

  - Implement articles listing page with search, filtering, and pagination
  - Create article detail page with improved layout and image preview
  - Add create article page with rich text editor and form validation
  - Add edit article page with consistent save flow matching create page
  - Implement publish/unpublish and archive/unarchive article actions
  - Add featured image upload with staged upload functionality on both create and edit pages
  - Change image preview aspect ratio from 4:3 to 16:9 for better visual consistency

  More here

  - Add xyz
```
- never do git commit yourself, just give the commit message, or warn/ask permission first if needed
- use pnpm
- if on claude code ultracode or dymanic workflows orchestration or what to do workflows, before doing the agents thing like, idk, these only examples what i remember what it can look like, i think it can be vary different with the real ultracode/dynamic workflows orchestration:
1. research
> agent 1: abc
> agent 2: def
> ...
2. adversarial
> agent 1: abc
> agent 2: def
> ...
3. judging
> agent 1: abc
> agent 2: def
> ...

please document it on md file first, and do not do immediately, cause my claude subscription has limit, if it limit when on that, the experience not good.

coding preferences (general)
- Keep things simple. Channel "yagni" energy unless told otherwise.
- Typesafety is useful, take advantage of it.
- Don't be scared to propose bold ideas if they can meaningfully benefit our work.
- Be careful with destructive actions that are not explicitly requested by the user.

coding preferences (typescript focused)
- `any` is the enemy. Inferred types are our friend. Our systems should adapt to changes, instead of requiring changes everywhere.
- If your TS code looks like a Python dev wrote it, it is bad TS code.
- Avoid one-line functions that are just casting wrappers.

questions are read-only
- A question is a request for an answer, not for changes. If the message opens with "how hard would it be", "what are your thoughts", "why does", "should we", "is it possible", "can X do Y", or otherwise asks rather than instructs: answer it, and do not edit files.
- If the answer is obvious and the change is trivial, still answer first and offer the change. Ask before making it.

visual and design work
- Do not edit real components first. For any non-trivial Ul, layout, or copy change, build several distinct static mocks, publish them with the htmltolink skill. Wait for a pick before implementing.
- Avoid continuously repainting CSS animations (pulse, shimmer, blur, spinners); they peg the GPU on high-refresh displays.
