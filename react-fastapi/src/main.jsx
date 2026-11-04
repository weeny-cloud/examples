import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  const [notes, setNotes] = useState([])
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')
  async function load() {
    const response = await fetch('/api/notes')
    if (!response.ok) throw new Error('Could not load notes')
    setNotes(await response.json())
  }
  useEffect(() => { load().catch((error) => setMessage(error.message)) }, [])
  async function save(event) {
    event.preventDefault()
    try {
      const response = await fetch('/api/notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      })
      if (!response.ok) throw new Error('Could not save note')
      setText('')
      setMessage('')
      await load()
    } catch (error) { setMessage(error.message) }
  }
  return <main>
    <h1>React and FastAPI persistent notes</h1>
    <p>Add a note, deploy again, and check it survives.</p>
    <form onSubmit={save}>
      <label htmlFor="note">Note</label>
      <input id="note" value={text} onChange={(event) => setText(event.target.value)} required maxLength={1000} />
      <button type="submit">Save note</button>
    </form>
    <p role="status">{message}</p>
    <ul>{notes.map((note) => <li key={note.id}>{note.text}</li>)}</ul>
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
