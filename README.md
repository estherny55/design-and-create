# Design & Create

Static site + Supabase shared committee editor.

## Files
- `index.html` — public member site
- `editor.html` — password-only committee editor
- `app.js` — games + public database loading
- `styles.css` — styling

## Committee login
The editor uses Supabase Auth with one shared committee account. The email is hidden from committee members; they only enter the shared password.
