# Small apps with persistent data

Runnable starters for [Weeny](https://weeny.cloud/), with local development instructions, pinned dependencies and SQLite data outside deployment releases. Each example also runs locally without a Weeny account.

| Starter | What you can try | Guide |
| --- | --- | --- |
| [Node.js + SQLite](node-sqlite/) | Save notes with Express and Node's built-in SQLite. No frontend build. | [Node deployment recipe](https://weeny.cloud/recipes/default) |
| [React + FastAPI](react-fastapi/) | A React note form and Python API served from one address. | [React + FastAPI recipe](https://weeny.cloud/recipes/react-fastapi) |
| [Streamlit + SQLite](streamlit/) | Save readings and view them in a dashboard across sessions. | [Streamlit deployment recipe](https://weeny.cloud/recipes/streamlit) |

Start with a folder above. Its README includes installation, run, deploy and persistence-check steps. Use Node.js 24 LTS for JavaScript examples and Python 3.12 or newer for Python examples.

## Run, change, keep your data

1. Clone this repository and install the chosen example's dependencies.
2. Set `WEENY_DATA_DIR` to an absolute directory outside the example's source folder.
3. Run the app, save a note or reading, then stop it.
4. Restart with the same data directory. Your saved record should still be there.

SQLite and uploaded data belong outside release folders. Code updates and database migrations are separate concerns: rolling back code does not roll back your data. Keep your own backups.

These examples have no app-level login. The Weeny instructions use **private exposure** so only allowed users can access the app. If exposed publicly, anyone with the URL can read and add records. Node notes older than 30 days are automatically removed; the other two examples retain records until you remove their database.

## Put your app online

[Weeny's free hosting](https://weeny.cloud/free) provides a persistent Linux server with HTTPS and idle sleep, subject to available places. Always-on hosting, custom domains and badge removal are paid features. Check the current offer before creating a server; this repository does not promise a free allocation.

Already have an app? Use the [deployment walkthrough](https://weeny.cloud/deploy/claude-code) or explore [all deployment recipes](https://weeny.cloud/recipes). These examples are optional starting points, not a required framework.

## Checks

After installing both JavaScript projects, building React, and installing each Python project's virtual environment:

```sh
node scripts/check.mjs
streamlit/.venv/bin/python streamlit/check.py
```

The HTTP checks use disposable databases and real local servers. They check input validation, frontend serving and data surviving process restarts. The Streamlit check drives its Save interaction and opens a fresh app session against the same temporary database.

## Contributing

Keep examples small, runnable and clear. Include a persistence check when changing storage behavior. Do not commit `.env` files, API keys, databases, dependencies or build output. Changes go through a pull request; deployment instructions must be exercised on isolated staging before being described as verified.

## License

MIT. Use these starters in your own projects. This repository contains example apps only; it does not include the Weeny platform source.
