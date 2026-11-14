# Christmas Calendar

A digital advent calendar built with React, TypeScript and Vite. Enter a code (e.g. `ivar`) to open that calendar.
Doors hold quotes or mini-games; progress is saved in the browser's `localStorage`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

- Add `?debug` to the URL (e.g. `/?debug#/c/ivar`) to unlock every door while testing.
- Calendars live in `src/calendars/`. Games shared by every calendar are listed in `src/calendars/index.ts`.
- Each game is an `engine.ts` (canvas) plus a small React wrapper in `src/games/<name>/`.
