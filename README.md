# Winnow

Turn raw PDFs and Word docs into clean, low-token Markdown before sending them to an LLM.
Everything runs entirely in the browser — no server, no login, no database. Nothing is
uploaded anywhere.

Stack: **React + Vite** only. Styled with plain inline `styles` objects — no CSS framework.

---

## Run it locally

```bash
# 1. unzip the project, then:
cd winnow-app  # or wherever you unzipped it
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`) and drop in a `.docx`, `.pdf`,
`.txt`, or `.md` file.

---

## Deploy (free)

Since this is a static site with no backend, any static host works. Vercel is the simplest:

1. Push the project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel auto-detects Vite:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. No environment variables needed.

Netlify works the same way — build command `npm run build`, publish directory `dist`.

---

## Project structure

```
winnow/
  src/
    lib/
      cleanup.js          # whitespace/repeated-header/page-number stripping
      htmlToMarkdown.js    # mammoth's HTML output -> Markdown
      pdfExtract.js         # pdf.js text + heading extraction
      tokenEstimate.js     # per-model character-ratio token estimates
    components/
      Header.jsx            # top nav
      UploadZone.jsx          # drag-and-drop file input
      StatCards.jsx             # summary stat cards + per-model bars
      ModelChart.jsx              # recharts bar chart comparison
      PreviewPanes.jsx              # raw vs cleaned text side-by-side
    App.jsx                # wires it all together, owns processing state
```

---

## Notes

- **Nothing leaves the browser.** DOCX (`mammoth`) and PDF (`pdf.js`) parsing both happen
  client-side, in memory. Closing or refreshing the tab discards everything — there's no
  persistence yet.
- **Token counts are estimates**, based on a character-per-token ratio per model family.
  Accurate enough to compare before/after, not exact billing figures.
- Large PDFs (100+ pages) parse fully in-browser and may take a few seconds. There's no
  file size limit enforced — add one in `UploadZone.jsx` if you want to cap it.

---

## Adding accounts + saved documents back later

The previous version of this project included Google sign-in and document history via
Supabase (auth + Postgres, both free tier). That's been stripped out for now to keep things
simple, but the pieces are easy to reintroduce when you want them:

- Supabase Auth for Google login
- A `documents` table (with Row Level Security) storing just the cleaned Markdown per user
- A "Save to my documents" button and a history panel to revisit past uploads

Just say the word and I'll add it back in.
