import express from 'express'
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Same Express + SQLite layout as /recipes/default; data stays outside releases.
const dataDir = process.env.WEENY_DATA_DIR ?? 'data'
mkdirSync(dataDir, { recursive: true })
const db = new DatabaseSync(join(dataDir, 'app.db'))
db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000')
db.exec(`CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY, text TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`)

const app = express()
app.use(express.json({ limit: '16kb' }))
app.use(express.static('public'))
app.get('/health', (req, res) => {
  db.prepare('SELECT 1').get()
  res.json({ ok: true })
})
app.get('/api/notes', (req, res) =>
  res.json(db.prepare('SELECT * FROM notes ORDER BY id DESC').all()))
app.post('/api/notes', (req, res) => {
  const text = req.body?.text
  if (typeof text !== 'string' || !text.trim() || text.length > 1000)
    return res.status(400).json({ error: 'text must contain 1–1000 characters' })
  const info = db.prepare('INSERT INTO notes (text) VALUES (?)').run(text.trim())
  res.status(201).json({ id: Number(info.lastInsertRowid), text: text.trim() })
})

const cleanup = setInterval(() => {
  try { db.prepare("DELETE FROM notes WHERE created_at < datetime('now','-30 days')").run() }
  catch (error) { console.error('cleanup failed:', error.message) }
}, 60 * 60 * 1000)
const server = app.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('Express notes ready'))
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    clearInterval(cleanup)
    server.close(() => { db.close(); process.exit(0) })
  })
}
