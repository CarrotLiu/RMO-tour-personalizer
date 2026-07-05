# ArcheoQuest Museum Management

Museum-side mockup for preparing an exhibition for the ArcheoQuest visitor app. All AI results
are simulated: the "generated" labels, challenges, sketches, and map are pre-authored from the
`final-prototype` assets so the flow can be demonstrated without an AI backend.

## The flow

### Exhibition setup (four pages, one at a time)

1. **Introductions** — museum and exhibition introduction (max 30 words each, live word
   counter) plus website links.
2. **Aspect types** — define the thematic aspect types for the exhibition (name, description,
   example photo); add or remove types.
3. **Artifact data sheet** — one row per artifact: artifact name, artifact label text,
   artifact time, and 5 photos (top, front, left side, right side, back).
4. **Floor plan** — upload the exhibition floor plan (shown as an architectural preview).

### AI generation (simulated)

Pressing **Generate draft with AI** plays a staged progress screen: reading the data sheet,
labelling artifacts, writing 6 challenges per artifact, sketching assets, and redrawing the
floor plan as an empty treasure map.

### Draft review

1. **Artifact labels** — toggle AI-assigned aspect labels, edit the highlight, see the
   AI-sketched unsolved/solved card covers and the evidence for each label.
2. **Challenges** — per artifact, edit the six drafts (text + image × low/medium/high effort):
   prompt, options, correct answer, explanation, and approval status. Image challenges show the
   generated sketch scene and sketch/photo options.
3. **Map locations** — drag each artifact (a dot with its name) onto the empty hand-drawn map
   and drop it to register its location; drag again to correct, save when all are placed.

## Tech stack

React · TypeScript · Tailwind CSS · Vite. No backend; all state is in-memory.

## Run

```bash
cd museum-management
npm install
npm run dev
```

## Structure

```text
museum-management/
  public/assets/          sketch + photo assets copied from final-prototype
  src/
    components/
      Badge.tsx
      Layout.tsx          sidebar with setup steps and (locked) draft views
      MapArt.tsx          floor-plan SVG and hand-drawn empty treasure map SVG
    data/exhibition.ts    intro, aspect types, artifacts, and pre-authored "AI" drafts
    pages/
      SetupPages.tsx      steps 1-4 and the AI generating screen
      DraftPages.tsx      artifact label review + challenge editor
      DraftMapPage.tsx    drag-and-drop location registration
    types/models.ts
    App.tsx               flow state machine
```
