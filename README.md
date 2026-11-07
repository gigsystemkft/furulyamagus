<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bac7c011-41cb-47b1-a445-a49db04e5a01

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Nickname accounts (CloudPanel)

The account API requires PHP with PDO MySQL and a MySQL/MariaDB database on the same HTTPS website.

1. Create a database and a database user in CloudPanel. Do not share the password publicly.
2. Import [`api/schema.sql`](./api/schema.sql) into that database.
3. Copy `api/config.example.php` to `api/config.php` on the server and enter the database connection details there. Do not commit or publish `config.php`.
4. Upload the `api/` directory next to the built `index.html` and `assets/` directory. PHP must be enabled for the website.
5. Build the frontend with `npm run build`, then upload the contents of `dist/` together with `api/`.

Registration imports the current browser's saved profile into the new account. Later progress is saved to the database. Accounts have no self-service password reset; a forgotten password requires a new account. The API requires HTTPS and stores passwords using PHP's `password_hash()`.
