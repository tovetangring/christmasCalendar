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

## Firebase (sign-in, saved progress, shared highscores)

With the Firebase settings in `.env.local` (copy `.env.example`), everyone signs in with Google and gets their own
calendar. Progress is saved in Firestore (`calendars/<uid>`) and the highscore lists are shared
(`highscores/<game>/players/<uid>`). Without `.env.local` everything runs locally, chosen by code, as before.

- Paste `firestore.rules` into Firebase: Firestore Database -> Rules -> Publish.
- The admin (in `src/lib/firebase.ts` and `firestore.rules`) can also open the code calendars via "Admin".
- When the site is hosted somewhere, add that domain under Authentication -> Settings -> Authorized domains.

## Hosting on Netlify

`netlify.toml` tells Netlify to run `npm run build` and publish `dist/`. In Netlify, add the same `VITE_FIREBASE_*`
variables as in `.env.local` (Site configuration -> Environment variables), then add the site's domain
(e.g. `julkalender.netlify.app`) in Firebase under Authentication -> Settings -> Authorized domains.
The app uses hash URLs (`#/...`), so no redirect rules are needed.
