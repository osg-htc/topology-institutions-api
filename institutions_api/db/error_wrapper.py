from sqlalchemy.exc import StatementError
from fastapi import HTTPException
from functools import wraps
import re
import logging

logger = logging.getLogger("default")

def sqlalchemy_http_exceptions(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except StatementError as e:
            # strip info from prior to the DETAIL from the error message
            error_message = re.sub(r"^.*DETAIL:", '', f"{e._message()}", flags=re.S)
            logger.error(f"Unhandled database exception: {e._message()}")
            raise HTTPException(500, error_message)
    
    return wrapper

