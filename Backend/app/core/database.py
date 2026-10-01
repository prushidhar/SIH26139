import asyncio
import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


def resolve_db_url() -> str:
    url = os.getenv("DATABASE_URL") or settings.DATABASE_URL
    # If using the defunct / paused Supabase tenant reference or empty, default to resilient local SQLite
    if not url or "vknujqpzwbxmfhdcgxpa" in url:
        return "sqlite+aiosqlite:///./quresight.db"

    # If postgres is specified, normalize dialect and check if driver is available
    if url.startswith("postgres://") or url.startswith("postgresql"):
        try:
            import asyncpg  # noqa: F401
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        except ImportError:
            print("[QureSight Database] asyncpg not installed; defaulting to local SQLite (quresight.db).")
            return "sqlite+aiosqlite:///./quresight.db"

    return url


ACTIVE_DB_URL = resolve_db_url()

# Resilient SQLite fallback engine that is always available and fully functional
fallback_engine = create_async_engine(
    "sqlite+aiosqlite:///./quresight.db",
    connect_args={"check_same_thread": False},
    echo=False,
)
FallbackSessionLocal = async_sessionmaker(
    bind=fallback_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


def create_engine_safely(db_url: str):
    """Safely creates an async engine, falling back to SQLite if dialect or connection fails."""
    try:
        if db_url.startswith("sqlite"):
            return create_async_engine(
                db_url,
                connect_args={"check_same_thread": False},
                echo=False,
            )
        else:
            return create_async_engine(
                db_url,
                connect_args={
                    "statement_cache_size": 0,
                    "prepared_statement_cache_size": 0,
                    "timeout": 3.0,
                },
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=10,
                pool_recycle=1800,
                pool_timeout=3,
                echo=False,
            )
    except Exception as exc:
        print(f"[QureSight Database] Primary engine creation error ({exc}); using local SQLite fallback.")
        return fallback_engine


engine = create_engine_safely(ACTIVE_DB_URL)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yields a database session with robust lifecycle management."""
    global AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """
    Initialize all database tables automatically on startup.
    Ensures both primary and fallback databases are always migrated and operational.
    """
    global engine, AsyncSessionLocal
    import app.models  # Registers User, UserSession, VerificationToken, Screening, Notification

    # 1. Always ensure local fallback database schema is fully populated first
    try:
        async with fallback_engine.begin() as fconn:
            await fconn.run_sync(Base.metadata.create_all)
        print("[QureSight Database] Local SQLite database verified and schema ready.")
    except Exception as e:
        print(f"[QureSight Database] Local schema init note: {e}")

    # 2. If using local SQLite as primary, we're all done
    if ACTIVE_DB_URL.startswith("sqlite"):
        print("[QureSight Database] Operating on local SQLite engine (quresight.db).")
        return

    # 3. For remote PostgreSQL, verify connectivity with a quick 3-second ping
    try:
        async def _connect_primary():
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)

        await asyncio.wait_for(_connect_primary(), timeout=3.0)
        print("[QureSight Backend] Remote PostgreSQL connected and initialized.")
    except Exception as db_err:
        print(f"[QureSight Backend] Remote DB unreachable ({db_err}). Activating local SQLite storage...")
        engine = fallback_engine
        AsyncSessionLocal = FallbackSessionLocal
        print("[QureSight Backend] Switched to local SQLite engine (quresight.db).")