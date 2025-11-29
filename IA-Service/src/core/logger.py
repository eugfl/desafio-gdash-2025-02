import logging
import json
import sys
from datetime import datetime


class JSONFormatter(logging.Formatter):
    # Padrão JSON do logging
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "filename": record.filename,
            "function": record.funcName,
            "line": record.lineno,
            "message": record.getMessage(),
        }
        return json.dumps(log_record)


def get_logger(name: str = __name__, level=logging.INFO) -> logging.Logger:
    logger = logging.getLogger(name)

    # Evita múltiplos handlers
    if logger.handlers:
        return logger

    logger.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())

    logger.addHandler(handler)
    return logger
