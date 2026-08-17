# Dome Dashboard

React/Vite implementation of the STRDOME Owners Dashboard, prepared so a dev
team can integrate it into IgniteHex or another modern frontend platform.

The previous static/PHP implementation is preserved under `legacy-static/` for
visual and behavior reference.

## Run Locally

Install dependencies, then start the Vite dev server:

```bash
npm install
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the production bundle locally:

```bash
npm run preview
```

## Integration Notes

- Real API keys and permissions should be connected through the host platform's
  backend or secret manager, not committed into the frontend repo.
- `src/services/dashboardApi.js` contains placeholder API methods for owner
  summary, portfolio, ecosystem access, and wallet session data.
- The current UI is rendered from the verified dashboard markup and initialized
  through `src/dashboard/initializeDashboard.js`. This keeps parity with the
  current live dashboard while giving the team a React/Vite project structure
  they can progressively split into smaller components.
- Public assets live in `public/`.

## Repository

GitHub repository: `https://github.com/Str-Claudiu/Dome_Dashboard`.
