import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

# Load .env from project root or backend dir, fallback to .env.example
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")
load_dotenv(ROOT_DIR / ".env.example")

DB_PATH = os.getenv("CACHE_DB_PATH", str(BASE_DIR / "cache.db"))

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip()

CACHE_EXPIRY_SECONDS = int(os.getenv("CACHE_EXPIRY_SECONDS", "86400"))  # 24 hours
