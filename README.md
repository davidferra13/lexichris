# Lexi + Chris

Standalone save-the-date / wedding microsite.

## Current architecture

- React + TypeScript + Vite
- Static-first production build
- Mobile-first responsive layout
- Matter.js mini pinball game
- Secret 7-taps-each ragdoll Easter egg
- GitHub Pages production deployment
- No dependency on DF Private Chef or the Raspberry Pi

## Content source of truth

Wedding facts live in `src/siteConfig.ts`.
The date and location intentionally remain unset until verified. The public UI never invents them.

## Local development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Production

Every push to `main` builds and deploys `dist/` through GitHub Pages.
