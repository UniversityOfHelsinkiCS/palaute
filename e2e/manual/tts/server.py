import hashlib
import io
import json
import os
import re
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import soundfile
import torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

MODEL_DIR = Path(os.environ["MODEL_DIR"])
VOICE_DIR = Path(os.environ["VOICE_DIR"])
# Part of the client's cache key, so a change to the packages, this file or the weights generates the clips again
MODEL_ID = hashlib.sha256(
    Path("uv.lock").read_bytes() + Path(__file__).read_bytes() + os.environ["MODEL_REVISION"].encode()
).hexdigest()[:16]
LANGUAGES = ["fi", "sv", "en"]
# A plain, steady tutorial voice. Near-zero temperature always picks the most likely sound (0 divides by zero).
GENERATE_OPTIONS = {"repetition_penalty": 1.2, "temperature": 0.01, "exaggeration": 0.1, "cfg_weight": 0.3}

SAMPLES_PER_TOKEN = 960  # 25 speech tokens per second at 24 kHz
# The last syllable is still being spoken when the model reaches the end of the text
TAIL_TOKENS = 12
SENTENCE_PAUSE_S = 0.5

model = ChatterboxMultilingualTTS.from_local(MODEL_DIR, "cpu")
default_conds = model.conds
lock = threading.Lock()
current_voice = "default"


def voices():
    return ["default", *sorted(p.stem for p in VOICE_DIR.glob("*.wav"))]


def use_voice(name):
    global current_voice
    if name == current_voice:
        return
    if name == "default":
        model.conds = default_conds
    else:
        path = VOICE_DIR / f"{name}.wav"
        if path.parent != VOICE_DIR or not path.exists():
            raise ValueError(f"Unknown voice {name}")
        model.prepare_conditionals(str(path), exaggeration=GENERATE_OPTIONS["exaggeration"])
    current_voice = name


def speak(sentence, lang, seed):
    # Same input, same audio, so a regenerated clip matches the one it replaces
    torch.manual_seed(seed)
    wav = model.generate(sentence, language_id=lang, **GENERATE_OPTIONS).squeeze(0)
    # The model can keep babbling after the text, so cut where its attention reached the end of the text
    completed_at = model.t3.patched_model.alignment_stream_analyzer.completed_at
    if completed_at is not None:
        wav = wav[: (completed_at + TAIL_TOKENS) * SAMPLES_PER_TOKEN]
    return wav


def synthesize(text, lang, voice):
    if lang not in LANGUAGES:
        raise ValueError(f"Unsupported language {lang}")
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s]
    pause = torch.zeros(int(SENTENCE_PAUSE_S * model.sr))
    with lock:
        use_voice(voice)
        parts = []
        for sentence in sentences:
            seed = int.from_bytes(hashlib.sha256(f"{voice}|{lang}|{sentence}".encode()).digest()[:4], "big")
            parts += [speak(sentence, lang, seed), pause]
    buffer = io.BytesIO()
    soundfile.write(buffer, torch.cat(parts[:-1]).numpy(), model.sr, format="WAV", subtype="PCM_16")
    return buffer.getvalue()


class Handler(BaseHTTPRequestHandler):
    def send(self, status, body, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path != "/health":
            return self.send(404, b"{}")
        self.send(200, json.dumps({"model": MODEL_ID, "languages": LANGUAGES, "voices": voices()}).encode())

    def do_POST(self):
        if self.path != "/synthesize":
            return self.send(404, b"{}")
        try:
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            audio = synthesize(body["text"], body["lang"], body.get("voice", "default"))
        except (KeyError, TypeError, ValueError) as error:
            return self.send(400, json.dumps({"error": str(error)}).encode())
        except Exception as error:
            return self.send(500, json.dumps({"error": repr(error)}).encode())
        self.send(200, audio, "audio/wav")


if __name__ == "__main__":
    print(f"Serving {MODEL_ID} on port {os.environ['PORT']}", flush=True)
    ThreadingHTTPServer(("", int(os.environ["PORT"])), Handler).serve_forever()
