const status = document.querySelector('#status')
async function load() {
  const response = await fetch('/api/notes')
  if (!response.ok) throw new Error('Could not load notes')
  const notes = await response.json()
  document.querySelector('#notes').replaceChildren(...notes.map(note => {
    const item = document.createElement('li')
    item.textContent = note.text
    return item
  }))
}
document.querySelector('form').addEventListener('submit', async event => {
  event.preventDefault()
  try {
    const response = await fetch('/api/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: document.querySelector('#note').value }),
    })
    if (!response.ok) throw new Error('Could not save note')
    document.querySelector('#note').value = ''
    status.textContent = ''
    await load()
  } catch (error) { status.textContent = error.message }
})
load().catch(error => { status.textContent = error.message })
