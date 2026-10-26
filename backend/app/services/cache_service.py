import sqlite3
import json
import time
from typing import Optional, Any
from pathlib import Path
from ..config import DB_PATH, CACHE_EXPIRY_SECONDS


class CacheService:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS cache (
                    key TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    expires_at REAL NOT NULL
                )
                """
            )
            conn.commit()

    def get(self, key: str, max_age: Optional[int] = None) -> Optional[Any]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT data, created_at, expires_at FROM cache WHERE key = ?",
                    (key,)
                )
                row = cursor.fetchone()
                if not row:
                    return None

                data_str, created_at, expires_at = row
                current_time = time.time()

                if max_age is not None:
                    if current_time - created_at > max_age:
                        return None
                elif current_time > expires_at:
                    return None

                return json.loads(data_str)
        except Exception as e:
            print(f"[CacheService] Error reading cache: {e}")
            return None

    def set(self, key: str, data: Any, ttl_seconds: int = CACHE_EXPIRY_SECONDS) -> None:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                created_at = time.time()
                expires_at = created_at + ttl_seconds
                data_str = json.dumps(data)
                cursor.execute(
                    """
                    INSERT INTO cache (key, data, created_at, expires_at)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(key) DO UPDATE SET
                        data = excluded.data,
                        created_at = excluded.created_at,
                        expires_at = excluded.expires_at
                    """,
                    (key, data_str, created_at, expires_at)
                )
                conn.commit()
        except Exception as e:
            print(f"[CacheService] Error writing cache: {e}")

    def clear(self) -> None:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM cache")
                conn.commit()
        except Exception as e:
            print(f"[CacheService] Error clearing cache: {e}")


# Singleton instance
cache_service = CacheService()
