import assert from 'node:assert/strict'
const [base = 'http://127.0.0.1:3000', mode] = process.argv.slice(2)
const text = process.env.CHECK_NOTE || 'legacy recipe persistence proof'
assert.equal((await fetch(base + '/health')).status, 200)
assert.match(await (await fetch(base)).text(), /persistent notes/)
if (mode !== '--read-only') {
  const response = await fetch(base + '/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
  assert.equal(response.status, 201)
  assert.equal((await response.json()).text, text)
  assert.equal((await fetch(base + '/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"text":""}' })).status, 400)
}
assert.ok((await (await fetch(base + '/api/notes')).json()).some(note => note.text === text))
console.log('PASS: health, frontend, validated note write and persistent note read')
