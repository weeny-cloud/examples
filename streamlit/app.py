"""A small dashboard whose saved readings survive process and code changes."""
import os
import sqlite3
from pathlib import Path
from contextlib import contextmanager

import streamlit as st

data_dir = Path(os.environ.get("WEENY_DATA_DIR", "./data"))
data_dir.mkdir(parents=True, exist_ok=True)


@contextmanager
def connect():
    connection = sqlite3.connect(data_dir / "readings.db", timeout=10)
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("CREATE TABLE IF NOT EXISTS readings (id INTEGER PRIMARY KEY, value REAL NOT NULL)")
    try:
        with connection:
            yield connection
    finally:
        connection.close()


st.title("Saved readings")
st.caption("A Streamlit dashboard backed by persistent SQLite.")
value = st.number_input("Reading", value=10.0)
if st.button("Save reading"):
    with connect() as db:
        db.execute("INSERT INTO readings (value) VALUES (?)", (value,))
    st.success("Reading saved")

with connect() as db:
    rows = db.execute("SELECT id, value FROM readings ORDER BY id").fetchall()
st.metric("Saved readings", len(rows))
if rows:
    st.line_chart({"reading": [row[1] for row in rows]})
    st.dataframe([{"id": row[0], "value": row[1]} for row in rows], hide_index=True)
