# Design & Create — V2 no-sign-up architecture

## Website
- `index.html` — public member site. No sign-up.
- `editor.html` — committee-only editor. No committee account or download required.
- `styles.css` — shared design.
- `app.js` — games and demo behaviour.

## Important
The current editor is a front-end demo. It uses browser storage and a temporary demo access code so the interface can be tested.

For the real live version:
- committee members will open `/editor.html` in their browser;
- they will enter one shared committee access code;
- they will not need GitHub, Supabase, downloads, or individual accounts;
- the access check and shared data will be handled securely by the backend;
- the member site will read published data from the same shared database.

Do not use the demo code as a real production password.
