import logging
from typing import Optional

from .config import get_settings


def configure_logging() -> None:
    settings = get_settings()
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )

    if settings.sentry_dsn:
        try:
            import sentry_sdk

            sentry_sdk.init(
                dsn=settings.sentry_dsn,
                traces_sample_rate=0.1,
                enable_tracing=True,
            )
        except ImportError:
            logging.getLogger(__name__).warning(
                "sentry-sdk not installed; skipping Sentry initialization"
            )


def get_logger(name: Optional[str] = None) -> logging.Logger:
    return logging.getLogger(name or "mcp-orchestrator")
