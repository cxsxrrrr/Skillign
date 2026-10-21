from collections import Counter

from flask import Blueprint, abort, g, jsonify, request

from .auth import login_required
from .catalog import (
    CATEGORIES,
    CATEGORY_BY_SLUG,
    SKILLS_BY_SLUG,
    category_counts,
    search_skills,
    serialize_skill,
    shelves,
    skills_for,
)
from .db import get_db
from .security import csrf_token

bp = Blueprint("api", __name__, url_prefix="/api")


def _user_payload(user):
    if user is None:
        return None
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


def _saved_slugs(user_id):
    return [
        row["slug"]
        for row in get_db()
        .execute("SELECT slug FROM saved_skills WHERE user_id = ?", (user_id,))
        .fetchall()
    ]


@bp.get("/session")
def session_info():
    saved_count = 0
    if g.user is not None:
        saved_count = get_db().execute(
            "SELECT COUNT(*) AS total FROM saved_skills WHERE user_id = ?",
            (g.user["id"],),
        ).fetchone()["total"]
    return jsonify(
        user=_user_payload(g.user),
        saved_count=saved_count,
        csrf_token=csrf_token(),
    )


@bp.get("/catalog")
def catalog():
    query = request.args.get("q", "").strip()
    category_slug = request.args.get("category", "").strip()
    active_category = CATEGORY_BY_SLUG.get(category_slug)
    if category_slug and active_category is None:
        abort(404, description="Categoría no encontrada.")

    results = search_skills(query) if query else []
    shelf_rows = []

    if active_category is not None:
        shelf_rows = [(active_category, skills_for(active_category["slug"]))]
    elif not query:
        shelf_rows = shelves()

    recommended = None
    if g.user is not None and not query and active_category is None:
        saved = _saved_slugs(g.user["id"])
        saved_skills = [SKILLS_BY_SLUG[slug] for slug in saved if slug in SKILLS_BY_SLUG]
        if saved_skills:
            top_category = Counter(skill["category"] for skill in saved_skills).most_common(1)[0][0]
            example = next(skill for skill in saved_skills if skill["category"] == top_category)
            suggestions = [
                skill for skill in skills_for(top_category) if skill["slug"] not in saved
            ][:7]
            if suggestions:
                recommended = {
                    "title": f"Porque te gustó {example['name']}",
                    "skills": [serialize_skill(skill) for skill in suggestions],
                }

    return jsonify(
        q=query,
        category=active_category,
        categories=CATEGORIES,
        counts=category_counts(),
        results=[serialize_skill(skill) for skill in results],
        shelves=[
            {
                "category": category,
                "skills": [serialize_skill(skill) for skill in category_skills],
            }
            for category, category_skills in shelf_rows
        ],
        recommended=recommended,
    )


@bp.get("/skills/<slug>")
def skill_detail(slug):
    skill = SKILLS_BY_SLUG.get(slug)
    if skill is None:
        abort(404, description="Skill no encontrada.")

    saved = False
    if g.user is not None:
        saved = (
            get_db()
            .execute(
                "SELECT 1 FROM saved_skills WHERE user_id = ? AND slug = ?",
                (g.user["id"], slug),
            )
            .fetchone()
            is not None
        )

    related = [item for item in skills_for(skill["category"]) if item["slug"] != slug][:7]
    return jsonify(
        skill=serialize_skill(skill),
        category=CATEGORY_BY_SLUG[skill["category"]],
        saved=saved,
        related=[serialize_skill(item) for item in related],
    )


@bp.post("/skills/<slug>/save")
@login_required
def toggle_save(slug):
    skill = SKILLS_BY_SLUG.get(slug)
    if skill is None:
        abort(404, description="Skill no encontrada.")

    database = get_db()
    exists = database.execute(
        "SELECT 1 FROM saved_skills WHERE user_id = ? AND slug = ?",
        (g.user["id"], slug),
    ).fetchone()

    if exists:
        database.execute(
            "DELETE FROM saved_skills WHERE user_id = ? AND slug = ?",
            (g.user["id"], slug),
        )
        message = f"{skill['name']} salió de tu colección."
        saved = False
    else:
        database.execute(
            "INSERT INTO saved_skills (user_id, slug) VALUES (?, ?)",
            (g.user["id"], slug),
        )
        message = f"{skill['name']} se guardó en tu colección."
        saved = True
    database.commit()

    saved_count = database.execute(
        "SELECT COUNT(*) AS total FROM saved_skills WHERE user_id = ?",
        (g.user["id"],),
    ).fetchone()["total"]
    return jsonify(saved=saved, saved_count=saved_count, message=message)


@bp.get("/saved")
@login_required
def saved():
    rows = (
        get_db()
        .execute(
            "SELECT slug FROM saved_skills WHERE user_id = ? ORDER BY created_at DESC, rowid DESC",
            (g.user["id"],),
        )
        .fetchall()
    )
    saved_skills = [
        serialize_skill(SKILLS_BY_SLUG[row["slug"]])
        for row in rows
        if row["slug"] in SKILLS_BY_SLUG
    ]
    return jsonify(skills=saved_skills, saved_count=len(saved_skills))


@bp.get("/health")
def health():
    return jsonify(status="ok")
