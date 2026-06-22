# Artifact asset packages

This folder is the working structure for the final prototype. Each artifact gets one package:

```text
artifacts/
  artifact-id/
    previews/
      unsolved.png
      solved.png
    map/
      location.png
    challenges/
      text-low/
      text-medium/
      text-high/
      image-low/
      image-medium/
      image-high/
      capture-low/
```

Use `manifest.json` as the source of truth for labels, challenge slots, and asset paths.

Challenge slot naming:

- `text-low`, `text-medium`, `text-high`: text-only challenges by effort level.
- `image-low`, `image-medium`, `image-high`: image-based challenges by effort level.
- `capture-low`: capture-only unlock flow for artifacts that do not need a follow-up challenge.

Current copied assets keep the old app working while future work can migrate to the artifact package paths.
