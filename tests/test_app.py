import re

import pytest

from skillign import create_app
from skillign.catalog import CATEGORIES, SKILLS


@pytest.fixture
def app(tmp_path):
    return create_app(
        {
            "TESTING": True,
            "SECRET_KEY": "test-secret",
            "DATABASE": str(tmp_path / "test.sqlite"),
            "SEED_DEMO": False,
            "SHOW_OTP": True,
            "FRONTEND_DIST": str(tmp_path / "dist"),
        }
    )


@pytest.fixture
def client(app):
    return app.test_client()


def csrf(client):
    response = client.get("/api/session")
    assert response.status_code == 200
    return response.get_json()["csrf_token"]


def post(client, path, payload, token):
    return client.post(
        path,
        json=payload,
        headers={"X-CSRF-Token": token},
    )


def register(client, name="Ada Lovelace", email="ada@example.com", password="secret123"):
    token = csrf(client)
    response = post(
        client,
        "/api/auth/signup",
        {"name": name, "email": email, "password": password, "confirm": password},
        token,
    )
    assert response.status_code == 201
    return response.get_json()


def save_skill(client, slug, token):
    return post(client, f"/api/skills/{slug}/save", {}, token)


def test_session_defaults(client):
    response = client.get("/api/session")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["user"] is None
    assert payload["saved_count"] == 0
    assert len(payload["csrf_token"]) > 20


def test_catalog_payload(client):
    response = client.get("/api/catalog")
    assert response.status_code == 200
    payload = response.get_json()

    assert len(payload["categories"]) == 6
    assert payload["counts"]["uiux"] == 9
    assert payload["counts"]["fundamentos"] == 8
    assert len(payload["shelves"]) == 6
    assert payload["shelves"][0]["category"]["slug"] == "uiux"
    assert payload["category"] is None
    assert payload["results"] == []

    first = payload["shelves"][0]["skills"][0]
    assert first["slug"] == "neobrutalist-css-ui"
    assert first["cover"]["lines"]
    assert first["resources"][0]["url"] == "/neobrutalist-css-ui.skill"
    assert "search_text" not in first
    assert "level" not in first
    assert "duration" not in first
    assert "format" not in first


def test_catalog_search_is_accent_insensitive(client):
    payload = client.get("/api/catalog?q=diseno").get_json()
    slugs = [skill["slug"] for skill in payload["results"]]
    assert "diseno-visual" in slugs


def test_catalog_category_filter(client):
    payload = client.get("/api/catalog?category=javascript").get_json()
    assert payload["category"]["slug"] == "javascript"
    assert len(payload["shelves"]) == 1
    assert payload["shelves"][0]["category"]["slug"] == "javascript"
    assert len(payload["shelves"][0]["skills"]) == 8


def test_invalid_category_returns_json_404(client):
    response = client.get("/api/catalog?category=no-existe")
    assert response.status_code == 404
    assert response.is_json
    assert "Categoría" in response.get_json()["error"]


@pytest.mark.parametrize("slug", [skill["slug"] for skill in SKILLS])
def test_every_skill_has_a_detail_endpoint(client, slug):
    response = client.get(f"/api/skills/{slug}")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["skill"]["slug"] == slug
    assert payload["saved"] is False
    assert len(payload["related"]) == 7


def test_missing_skill_returns_json_404(client):
    response = client.get("/api/skills/no-existe")
    assert response.status_code == 404
    assert response.is_json
    assert "Skill" in response.get_json()["error"]


def test_saved_requires_login(client):
    response = client.get("/api/saved")
    assert response.status_code == 401
    assert response.get_json()["error"]


def test_save_requires_login(client):
    token = csrf(client)
    response = client.post(
        "/api/skills/flexbox/save",
        json={},
        headers={"X-CSRF-Token": token},
    )
    assert response.status_code == 401


def test_post_without_csrf_is_rejected(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "ada@example.com", "password": "secret123"},
    )
    assert response.status_code == 400
    assert "CSRF" in response.get_json()["error"]


def test_register_login_and_logout(client):
    payload = register(client)
    assert payload["user"]["email"] == "ada@example.com"
    assert payload["saved_count"] == 0

    session = client.get("/api/session").get_json()
    assert session["user"]["name"] == "Ada Lovelace"

    token = session["csrf_token"]
    response = post(client, "/api/auth/logout", {}, token)
    assert response.status_code == 200
    assert client.get("/api/session").get_json()["user"] is None

    token = client.get("/api/session").get_json()["csrf_token"]
    response = post(
        client,
        "/api/auth/login",
        {"email": "ada@example.com", "password": "secret123", "remember": True},
        token,
    )
    assert response.status_code == 200
    assert response.get_json()["user"]["email"] == "ada@example.com"


def test_login_rejects_wrong_password(client):
    register(client)
    token = client.get("/api/session").get_json()["csrf_token"]
    response = post(
        client,
        "/api/auth/login",
        {"email": "ada@example.com", "password": "incorrecta"},
        token,
    )
    assert response.status_code == 401
    assert "Email o contraseña" in response.get_json()["error"]


def test_signup_validation(client):
    token = csrf(client)
    response = post(
        client,
        "/api/auth/signup",
        {
            "name": "A",
            "email": "no-es-email",
            "password": "123",
            "confirm": "456",
        },
        token,
    )
    assert response.status_code == 400
    errors = response.get_json()["errors"]
    assert set(errors) == {"name", "email", "password", "confirm"}


def test_signup_duplicate_email(client):
    register(client)
    token = client.get("/api/session").get_json()["csrf_token"]
    response = post(
        client,
        "/api/auth/signup",
        {
            "name": "Otra Persona",
            "email": "ada@example.com",
            "password": "secret123",
            "confirm": "secret123",
        },
        token,
    )
    assert response.status_code == 400
    assert "email" in response.get_json()["errors"]


def test_save_and_unsave_skill(client):
    payload = register(client)
    token = payload["csrf_token"]

    response = save_skill(client, "flexbox", token)
    assert response.status_code == 200
    assert response.get_json()["saved"] is True
    assert response.get_json()["saved_count"] == 1

    detail = client.get("/api/skills/flexbox").get_json()
    assert detail["saved"] is True

    saved = client.get("/api/saved").get_json()
    assert saved["saved_count"] == 1
    assert saved["skills"][0]["slug"] == "flexbox"

    token = client.get("/api/session").get_json()["csrf_token"]
    response = save_skill(client, "flexbox", token)
    assert response.get_json()["saved"] is False
    assert client.get("/api/saved").get_json()["skills"] == []


def test_recommendations_follow_saved_category(client):
    payload = register(client)
    token = payload["csrf_token"]
    save_skill(client, "flexbox", token)
    token = client.get("/api/session").get_json()["csrf_token"]
    save_skill(client, "css-grid", token)

    catalog = client.get("/api/catalog").get_json()
    assert catalog["recommended"] is not None
    assert catalog["recommended"]["title"].startswith("Porque te gustó")
    assert all(skill["category"] == "layout" for skill in catalog["recommended"]["skills"])


def test_password_reset_flow(app, client):
    register(client)
    anonymous = app.test_client()
    token = anonymous.get("/api/session").get_json()["csrf_token"]

    response = post(
        anonymous,
        "/api/auth/forgot",
        {"email": "ada@example.com", "repeat": "ada@example.com"},
        token,
    )
    assert response.status_code == 200
    assert response.get_json()["email"] == "ada@example.com"

    verify_info = anonymous.get("/api/auth/verify?email=ada@example.com")
    assert verify_info.status_code == 200
    demo_code = verify_info.get_json()["demo_code"]
    assert re.fullmatch(r"\d{6}", demo_code)

    wrong = "000000" if demo_code != "000000" else "111111"
    response = post(
        anonymous,
        "/api/auth/verify",
        {"email": "ada@example.com", "code": wrong},
        token,
    )
    assert response.status_code == 400
    assert "code" in response.get_json()["errors"]

    response = post(
        anonymous,
        "/api/auth/verify",
        {"email": "ada@example.com", "code": demo_code},
        token,
    )
    assert response.status_code == 200

    reset_info = anonymous.get("/api/auth/reset").get_json()
    assert reset_info["email"] == "ada@example.com"

    response = post(
        anonymous,
        "/api/auth/reset",
        {"password": "nueva123", "confirm": "nueva123"},
        token,
    )
    assert response.status_code == 200

    token = anonymous.get("/api/session").get_json()["csrf_token"]
    response = post(
        anonymous,
        "/api/auth/login",
        {"email": "ada@example.com", "password": "nueva123"},
        token,
    )
    assert response.status_code == 200
    assert response.get_json()["user"]["email"] == "ada@example.com"


def test_reset_requires_verified_session(client):
    token = csrf(client)
    response = post(
        client,
        "/api/auth/reset",
        {"password": "nueva123", "confirm": "nueva123"},
        token,
    )
    assert response.status_code == 403


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_security_headers(client):
    response = client.get("/api/catalog")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"


def test_cors_allows_firebase_origin_with_credentials(client):
    response = client.options(
        "/api/session",
        headers={
            "Origin": "https://skillign.web.app",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.headers["Access-Control-Allow-Origin"] == "https://skillign.web.app"
    assert response.headers["Access-Control-Allow-Credentials"] == "true"


def test_cors_allows_csrf_header(client):
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "https://skillign.web.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-csrf-token",
        },
    )
    allowed = response.headers["Access-Control-Allow-Headers"].lower()
    assert "x-csrf-token" in allowed


def test_unknown_api_route_returns_json(client):
    response = client.get("/api/no-existe")
    assert response.status_code == 404
    assert response.is_json
