# Design & Create

Static site + Supabase shared committee editor.

## Files
- `index.html` — public member site
- `editor.html` — password-only committee editor
- `app.js` — games + public database loading
- `styles.css` — styling

## Committee login
The editor uses Supabase Auth with one shared committee account. The email is hidden from committee members; they only enter the shared password.


## Group chat sign-ups
The public site collects a student's name and year group in the `members` table. Committee members can review requests in the editor and mark students as added to the group chat.
