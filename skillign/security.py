import secrets

from flask import session


def csrf_token():
    token = session.get("_csrf")
    if not token:
        token = secrets.token_hex(16)
        session["_csrf"] = token
    return token


def rotate_csrf_token():
    token = secrets.token_hex(16)
    session["_csrf"] = token
    return token
