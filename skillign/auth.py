import hashlib
import re
import secrets
import time
from functools import wraps

from flask import (
    Blueprint,
    current_app,
    g,
    jsonify,
    request,
    session,
)
from werkzeug.security import check_password_hash, generate_password_hash

from .db import get_db
from .security import rotate_csrf_token

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def login_required(view):
    @wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify(error="Inicia sesión para continuar."), 401
        return view(**kwargs)

    return wrapped_view


def _user_payload(user):
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


def _saved_count(user_id):
    return get_db().execute(
        "SELECT COUNT(*) AS total FROM saved_skills WHERE user_id = ?", (user_id,)
    ).fetchone()["total"]


def _error(message, errors=None, status=400):
    payload = {"error": message}
    if errors:
        payload["errors"] = errors
    return jsonify(payload), status


def _hash_code(code):
    secret = str(current_app.config["SECRET_KEY"]).encode("utf-8")
    return hashlib.sha256(secret + code.encode("utf-8")).hexdigest()


def _create_otp(user_id):
    code = f"{secrets.randbelow(1_000_000):06d}"
    database = get_db()
    database.execute("DELETE FROM otp_codes WHERE user_id = ?", (user_id,))
    database.execute(
        "INSERT INTO otp_codes (user_id, code_hash, expires_at) VALUES (?, ?, ?)",
        (user_id, _hash_code(code), int(time.time()) + 600),
    )
    database.commit()
    return code


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    errors = {}

    if not email:
        errors["email"] = "Escribe tu email."
    elif not EMAIL_RE.match(email):
        errors["email"] = "Ese email no parece válido."
    if not password:
        errors["password"] = "Escribe tu contraseña."

    if errors:
        return _error("Revisa los campos.", errors)

    user = get_db().execute(
        "SELECT * FROM users WHERE email = ? COLLATE NOCASE", (email,)
    ).fetchone()
    if user is None or not check_password_hash(user["password_hash"], password):
        return _error("Email o contraseña incorrectos.", status=401)

    session.clear()
    session["user_id"] = user["id"]
    session.permanent = bool(data.get("remember"))
    token = rotate_csrf_token()
    return jsonify(
        user=_user_payload(user),
        saved_count=_saved_count(user["id"]),
        csrf_token=token,
        message=f"Bienvenido de nuevo, {user['name'].split()[0]}.",
    )


@bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm = data.get("confirm") or ""
    errors = {}

    if len(name) < 2:
        errors["name"] = "Escribe tu nombre."
    elif len(name) > 80:
        errors["name"] = "Usa un nombre más corto."
    if not email:
        errors["email"] = "Escribe tu email."
    elif not EMAIL_RE.match(email):
        errors["email"] = "Ese email no parece válido."
    if len(password) < 8:
        errors["password"] = "Usa al menos 8 caracteres."
    if confirm != password:
        errors["confirm"] = "Las contraseñas no coinciden."

    if not errors:
        database = get_db()
        if database.execute(
            "SELECT 1 FROM users WHERE email = ? COLLATE NOCASE", (email,)
        ).fetchone():
            errors["email"] = "Ya existe una cuenta con ese email."
        else:
            cursor = database.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (name, email, generate_password_hash(password)),
            )
            database.commit()
            session.clear()
            session["user_id"] = cursor.lastrowid
            token = rotate_csrf_token()
            return (
                jsonify(
                    user={
                        "id": cursor.lastrowid,
                        "name": name,
                        "email": email,
                    },
                    saved_count=0,
                    csrf_token=token,
                    message=f"Tu cuenta está lista, {name.split()[0]}. Empieza a explorar.",
                ),
                201,
            )

    return _error("Revisa los campos.", errors)


@bp.post("/logout")
def logout():
    session.clear()
    token = rotate_csrf_token()
    return jsonify(message="Sesión cerrada. Hasta pronto.", csrf_token=token)


@bp.post("/forgot")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    repeat = (data.get("repeat") or "").strip().lower()
    errors = {}

    if not email:
        errors["email"] = "Escribe tu email."
    elif not EMAIL_RE.match(email):
        errors["email"] = "Ese email no parece válido."
    if repeat != email:
        errors["repeat"] = "Los emails no coinciden."

    if errors:
        return _error("Revisa los campos.", errors)

    user = get_db().execute(
        "SELECT * FROM users WHERE email = ? COLLATE NOCASE", (email,)
    ).fetchone()

    if user is not None:
        code = _create_otp(user["id"])
        session["otp_email"] = email
        session["otp_demo"] = code if current_app.config["SHOW_OTP"] else None
    else:
        session["otp_email"] = email
        session["otp_demo"] = None

    return jsonify(
        email=email,
        message="Si la cuenta existe, enviamos un código de verificación.",
    )


@bp.get("/verify")
def verify_status():
    email = (request.args.get("email") or session.get("otp_email") or "").strip().lower()
    if not email:
        return _error("Primero escribe el email de tu cuenta.", status=400)
    demo_code = session.get("otp_demo") if session.get("otp_email") == email else None
    return jsonify(email=email, demo_code=demo_code)


@bp.post("/verify")
def verify_otp():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or session.get("otp_email") or "").strip().lower()
    code = "".join(char for char in (data.get("code") or "") if char.isdigit())

    if not email:
        return _error("Primero escribe el email de tu cuenta.")
    if len(code) != 6:
        return _error("Revisa el código.", {"code": "Introduce los 6 dígitos."})

    database = get_db()
    user = database.execute(
        "SELECT * FROM users WHERE email = ? COLLATE NOCASE", (email,)
    ).fetchone()
    otp = None
    if user is not None:
        otp = database.execute(
            "SELECT * FROM otp_codes WHERE user_id = ? AND used = 0 ORDER BY id DESC LIMIT 1",
            (user["id"],),
        ).fetchone()

    if user is None or otp is None:
        return _error(
            "Código no válido.",
            {"code": "El código no es válido o ya expiró."},
        )
    if otp["attempts"] >= 5:
        return _error(
            "Demasiados intentos.",
            {"code": "Solicita un código nuevo."},
        )
    if otp["expires_at"] < int(time.time()):
        database.execute("UPDATE otp_codes SET used = 1 WHERE id = ?", (otp["id"],))
        database.commit()
        return _error(
            "Código expirado.",
            {"code": "El código expiró. Solicita uno nuevo."},
        )
    if not secrets.compare_digest(otp["code_hash"], _hash_code(code)):
        attempts = otp["attempts"] + 1
        database.execute(
            "UPDATE otp_codes SET attempts = ?, used = ? WHERE id = ?",
            (attempts, 1 if attempts >= 5 else 0, otp["id"]),
        )
        database.commit()
        message = (
            "Solicita un código nuevo."
            if attempts >= 5
            else "Revísalo e inténtalo de nuevo."
        )
        return _error(
            "Código incorrecto.",
            {"code": message},
        )

    database.execute("UPDATE otp_codes SET used = 1 WHERE user_id = ?", (user["id"],))
    database.commit()
    session["reset_user_id"] = user["id"]
    session.pop("otp_demo", None)
    session.pop("otp_email", None)
    return jsonify(ok=True, message="Código verificado.")


@bp.get("/reset")
def reset_status():
    user_id = session.get("reset_user_id")
    if user_id is None:
        return _error("Solicita un código para restablecer tu contraseña.", status=403)
    user = get_db().execute("SELECT email FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        session.pop("reset_user_id", None)
        return _error("La cuenta ya no existe.", status=403)
    return jsonify(email=user["email"])


@bp.post("/reset")
def reset_password():
    user_id = session.get("reset_user_id")
    if user_id is None:
        return _error("Solicita un código para restablecer tu contraseña.", status=403)

    data = request.get_json(silent=True) or {}
    password = data.get("password") or ""
    confirm = data.get("confirm") or ""
    errors = {}

    if len(password) < 8:
        errors["password"] = "Usa al menos 8 caracteres."
    if confirm != password:
        errors["confirm"] = "Las contraseñas no coinciden."
    if errors:
        return _error("Revisa los campos.", errors)

    database = get_db()
    user = database.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        session.pop("reset_user_id", None)
        return _error("La cuenta ya no existe.", status=403)

    database.execute(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        (generate_password_hash(password), user_id),
    )
    database.execute("DELETE FROM otp_codes WHERE user_id = ?", (user_id,))
    database.commit()
    session.pop("reset_user_id", None)
    return jsonify(message="Contraseña actualizada. Ya puedes iniciar sesión.")
