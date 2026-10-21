import os
import secrets
from datetime import timedelta
from pathlib import Path

from flask import (
    Flask,
    abort,
    g,
    jsonify,
    request,
    send_from_directory,
    session,
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash

from . import db
from .catalog import SKILLS_BY_SLUG


def _seed_demo():
    database = db.get_db()
    if database.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"]:
        return

    cursor = database.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        ("Demo", "demo@skillign.dev", generate_password_hash("demo1234")),
    )
    for slug in ("flexbox", "accesibilidad-web", "react"):
        if slug in SKILLS_BY_SLUG:
            database.execute(
                "INSERT OR IGNORE INTO saved_skills (user_id, slug) VALUES (?, ?)",
                (cursor.lastrowid, slug),
            )
    database.commit()


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True, static_folder=None)
    project_root = Path(app.root_path).parent
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY") or secrets.token_hex(32),
        DATABASE=os.path.join(app.instance_path, "skillign.sqlite"),
        SHOW_OTP=os.environ.get("SHOW_OTP", "1") == "1",
        SEED_DEMO=os.environ.get("SEED_DEMO", "1") == "1",
        PERMANENT_SESSION_LIFETIME=timedelta(days=14),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE=os.environ.get("SESSION_COOKIE_SAMESITE", "Lax"),
        SESSION_COOKIE_SECURE=os.environ.get("SESSION_COOKIE_SECURE", "0").lower()
        in {"1", "true", "yes"},
        CORS_ORIGINS=os.environ.get(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,https://skillign-ai.web.app",
        ),
        MAX_CONTENT_LENGTH=1_000_000,
        FRONTEND_DIST=os.environ.get(
            "FRONTEND_DIST", str(project_root / "frontend" / "dist")
        ),
    )
    if test_config is not None:
        app.config.update(test_config)

    os.makedirs(app.instance_path, exist_ok=True)
    db.init_app(app)

    cors_origins = app.config["CORS_ORIGINS"]
    if isinstance(cors_origins, str):
        cors_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
    CORS(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
        methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "X-CSRF-Token"],
    )

    from .auth import bp as auth_bp
    from .views import bp as api_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)

    @app.before_request
    def load_logged_in_user():
        user_id = session.get("user_id")
        g.user = None
        if user_id is not None:
            user = db.get_db().execute(
                "SELECT id, name, email FROM users WHERE id = ?", (user_id,)
            ).fetchone()
            if user is None:
                session.clear()
            else:
                g.user = user

    @app.before_request
    def protect_from_csrf():
        if request.method not in {"POST", "PUT", "PATCH", "DELETE"}:
            return
        expected = session.get("_csrf")
        supplied = request.headers.get("X-CSRF-Token") or request.form.get(
            "csrf_token", ""
        )
        if not expected or not supplied or not secrets.compare_digest(expected, supplied):
            abort(400, description="Token CSRF inválido o sesión expirada.")

    @app.after_request
    def set_security_headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        return response

    def serve_spa(path=""):
        if path.startswith("api/"):
            abort(404)
        dist = Path(app.config["FRONTEND_DIST"])
        index = dist / "index.html"
        if path:
            target = (dist / path).resolve()
            if target.is_file() and target.is_relative_to(dist.resolve()):
                return send_from_directory(str(dist), path)
            if Path(path).suffix or path.startswith(("assets/", "static/")):
                return (
                    "Recurso no encontrado.",
                    404,
                    {"Content-Type": "text/plain; charset=utf-8"},
                )
        if index.is_file():
            return send_from_directory(str(dist), "index.html")
        return (
            "El frontend aún no está compilado. Ejecuta `npm install` y "
            "`npm run build` dentro de frontend/, o usa `npm run dev`.",
            503,
            {"Content-Type": "text/plain; charset=utf-8"},
        )

    app.add_url_rule("/", endpoint="spa_root", view_func=serve_spa, defaults={"path": ""})
    app.add_url_rule("/<path:path>", endpoint="spa_path", view_func=serve_spa)

    @app.errorhandler(400)
    def bad_request(error):
        return (
            jsonify(error=getattr(error, "description", None) or "Solicitud no válida."),
            400,
        )

    @app.errorhandler(404)
    def not_found(error):
        if request.path.startswith("/api/"):
            return (
                jsonify(
                    error=getattr(error, "description", None)
                    or "Recurso no encontrado."
                ),
                404,
            )
        return serve_spa(request.path.lstrip("/"))

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify(error="Método no permitido."), 405

    @app.errorhandler(500)
    def server_error(error):
        return jsonify(error="Algo se rompió. Inténtalo de nuevo."), 500

    with app.app_context():
        db.init_db()
        if app.config["SEED_DEMO"]:
            _seed_demo()

    return app
