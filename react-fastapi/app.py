import os
import sqlite3
from contextlib import asynccontextmanager, contextmanager
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

DATA = Path(os.environ.get('WEENY_DATA_DIR', './data'))
DIST = Path(__file__).resolve().parent / 'dist'


@contextmanager
def connect():
    connection = sqlite3.connect(DATA / 'notes.sqlite', timeout=5)
    connection.row_factory = sqlite3.Row
    try:
        with connection:
            yield connection
    finally:
        connection.close()


@asynccontextmanager
async def lifespan(app):
    DATA.mkdir(parents=True, exist_ok=True)
    with connect() as db:
        db.execute('PRAGMA journal_mode = WAL')
        db.execute('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)')
    yield


app = FastAPI(lifespan=lifespan)


class Note(BaseModel):
    text: str = Field(min_length=1, max_length=1000, pattern=r'\S')


@app.get('/api/notes')
def list_notes():
    with connect() as db:
        return [dict(row) for row in db.execute('SELECT id, text FROM notes ORDER BY id DESC')]


@app.post('/api/notes', status_code=201)
def create_note(note: Note):
    with connect() as db:
        cursor = db.execute('INSERT INTO notes (text) VALUES (?)', (note.text.strip(),))
        return {'id': cursor.lastrowid, 'text': note.text.strip()}


# FastAPI 0.162: API routes take precedence; missing assets retain a real 404.
# check_dir=False also lets the separate Vite development server start first.
app.frontend('/', directory=str(DIST), fallback='index.html', check_dir=False)
