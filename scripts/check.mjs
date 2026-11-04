import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const temporary = await mkdtemp(join(tmpdir(), 'weeny-examples-'))
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

async function unusedPort() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  return port
}

async function exercise(folder, command, args, rejectedStatus) {
  const port = await unusedPort()
  const base = `http://127.0.0.1:${port}`
  const text = `Persistence proof for ${folder}`
  let child
  let output = ''
  let spawnError
  async function start() {
    output = ''
    spawnError = undefined
    child = spawn(command, args, { cwd: join(root, folder), env: {
      ...process.env, PORT: String(port), WEENY_DATA_DIR: join(temporary, folder),
    }, stdio: ['ignore', 'pipe', 'pipe'] })
    child.stdout.on('data', chunk => { output += chunk })
    child.stderr.on('data', chunk => { output += chunk })
    child.on('error', error => { spawnError = error })
    for (let attempt = 0; attempt < 100; attempt++) {
      if (spawnError) throw spawnError
      if (child.exitCode !== null) throw Error(`${folder} stopped: ${output}`)
      try { if ((await fetch(base + '/api/notes', { signal: AbortSignal.timeout(500) })).ok) return }
      catch {}
      await pause(100)
    }
    throw Error(`${folder} did not start: ${output}`)
  }
  async function stop() {
    if (!child?.pid || child.exitCode !== null) return
    const exited = once(child, 'exit')
    child.kill('SIGTERM')
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000)
    try { await exited } finally { clearTimeout(timer) }
  }
  try {
    await start()
    assert.equal((await fetch(base)).status, 200)
    const post = text => fetch(base + '/api/notes', { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    for (const invalid of ['', '   ', 'x'.repeat(1001)]) assert.equal((await post(invalid)).status, rejectedStatus)
    const saved = await post(text)
    assert.equal(saved.status, 201)
    assert.equal((await saved.json()).text, text)
    if (folder === 'react-fastapi') {
      assert.equal((await fetch(base + '/assets/missing.js')).status, 404)
      assert.equal((await fetch(base + '/a/client/route', { headers: { Accept: 'text/html' } })).status, 200)
    } else assert.equal((await fetch(base + '/health')).status, 200)
    await stop()
    await start()
    const notes = await (await fetch(base + '/api/notes')).json()
    assert.ok(notes.some(note => note.text === text), 'Saved note must survive a process restart')
    console.log(`PASS ${folder}: frontend, validation, save, restart and persistent read`)
  } finally { await stop() }
}

try {
  await exercise('node-sqlite', process.execPath, ['server.mjs'], 400)
  await exercise('react-fastapi', 'sh', ['run.sh'], 422)
} finally { await rm(temporary, { recursive: true, force: true }) }
