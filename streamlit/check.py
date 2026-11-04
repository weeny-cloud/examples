"""Run with .venv/bin/python check.py; uses a disposable database."""
import os
import tempfile
from pathlib import Path

from streamlit.testing.v1 import AppTest

with tempfile.TemporaryDirectory() as directory:
    os.environ["WEENY_DATA_DIR"] = directory
    app = AppTest.from_file(str(Path(__file__).with_name("app.py")), default_timeout=20).run()
    assert not app.exception
    app.number_input[0].set_value(42.0)
    app.button[0].click().run()
    assert not app.exception
    assert app.metric[0].value == "1"
    fresh = AppTest.from_file(str(Path(__file__).with_name("app.py")), default_timeout=20).run()
    assert not fresh.exception
    assert fresh.metric[0].value == "1"
    print("PASS: interactive save and a fresh Streamlit session retain the reading")
