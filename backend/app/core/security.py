import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from jose import jwt

from app.core.config import get_settings

ALGORITHM = "HS256"


def create_access_token(subject: str, expires_minutes: int = 60 * 24) -> str:
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(minutes=expires_minutes)
    return jwt.encode({"sub": subject, "exp": expire}, settings.secret_key, algorithm=ALGORITHM)


def hash_password(password: str) -> str:
    # Secure random 16-byte hex salt
    salt = secrets.token_hex(16)
    # Perform 100,000 iterations of SHA256 PBKDF2
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    # Format: pbkdf2_sha256:iterations:salt:hash
    return f"pbkdf2_sha256:100000:{salt}:{pw_hash.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    try:
        # Fallback in case of old bcrypt hashes
        if not hashed.startswith("pbkdf2_sha256:"):
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            return pwd_context.verify(password, hashed)

        parts = hashed.split(":")
        if len(parts) != 4:
            return False

        algorithm, iterations, salt, pw_hash = parts
        iterations = int(iterations)

        test_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        )
        return secrets.compare_digest(test_hash.hex(), pw_hash)
    except Exception:
        return False
