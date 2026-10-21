
import os
import re
from datetime import date

from flask import Flask, jsonify, request
from sqlalchemy import or_

from models import db, Memory

app = Flask(__name__)
app.logger.setLevel("INFO")
ADMIN_PIN = os.getenv("ADMIN_PIN")


def verify_admin_pin():
    provided_pin = request.headers.get("X-Admin-PIN", "")

    if not ADMIN_PIN or provided_pin != ADMIN_PIN:
        return False

    return True

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/little_things"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

@app.before_request
def log_request():
    app.logger.info(
        "%s %s",
        request.method,
        request.path
    )

ALLOWED_CATEGORIES = {
    "self-love",
    "friendship",
    "achievement",
    "family",
    "random happiness",
}


def validation_error(details):
    return jsonify({
        "error": "Validasi gagal",
        "details": details
    }), 400


def memory_to_dict(memory):
    return {
        "id": memory.id,
        "title": memory.title,
        "story": memory.story,
        "memory_date": memory.memory_date.isoformat(),
        "category": memory.category,
        "happiness_level": memory.happiness_level,
        "created_at": memory.created_at.isoformat(),
    }


def validate_memory_data(data, partial=False):
    details = {}
    cleaned = {}

    if not isinstance(data, dict):
        return {}, {"body": "Body harus berupa JSON object"}

    required_fields = [
        "title",
        "story",
        "memory_date",
        "category",
        "happiness_level",
    ]

    for field in required_fields:
        if not partial and field not in data:
            details[field] = f"{field} wajib diisi"

    if "title" in data:
        value = data["title"]
        if not isinstance(value, str) or not value.strip():
            details["title"] = "Judul wajib diisi"
        elif len(value.strip()) > 150:
            details["title"] = "Judul maksimal 150 karakter"
        else:
            cleaned["title"] = value.strip()

    if "story" in data:
        value = data["story"]
        if not isinstance(value, str) or not value.strip():
            details["story"] = "Cerita wajib diisi"
        else:
            cleaned["story"] = value.strip()

    if "memory_date" in data:
        value = data["memory_date"]
        if (
            not isinstance(value, str)
            or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value)
        ):
            details["memory_date"] = "Tanggal harus berformat YYYY-MM-DD"
        else:
            try:
                cleaned["memory_date"] = date.fromisoformat(value)
            except ValueError:
                details["memory_date"] = "Tanggal tidak valid"

    if "category" in data:
        value = data["category"]
        if not isinstance(value, str) or value not in ALLOWED_CATEGORIES:
            details["category"] = "Kategori tidak valid"
        else:
            cleaned["category"] = value

    if "happiness_level" in data:
        value = data["happiness_level"]
        if type(value) is not int or not 1 <= value <= 5:
            details["happiness_level"] = (
                "Tingkat kebahagiaan harus berupa angka 1 sampai 5"
            )
        else:
            cleaned["happiness_level"] = value

    return cleaned, details

@app.post("/api/verify-pin")
def verify_pin_endpoint():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Body harus berupa JSON"}), 400

    provided_pin = data.get("pin", "")

    if not isinstance(provided_pin, str) or not provided_pin:
        return jsonify({"error": "PIN wajib diisi"}), 400

    if not ADMIN_PIN or provided_pin != ADMIN_PIN:
        return jsonify({"error": "PIN Admin salah"}), 401

    return jsonify({"message": "PIN Admin benar"}), 200

@app.get("/")
def home():
    return jsonify({
        "message": "Little Things Archive API is running!"
    })


@app.get("/health")
def health():
    try:
        db.session.execute(db.text("SELECT 1"))
        return jsonify({
            "status": "ok",
            "service": "little-things-archive-api",
            "database": "connected",
        }), 200
    except Exception:
        app.logger.exception("Database health check failed")
        return jsonify({
            "status": "error",
            "database": "unavailable",
        }), 503


@app.get("/api/memories")
def get_memories():
    query = Memory.query

    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Memory.title.ilike(pattern),
                Memory.story.ilike(pattern),
            )
        )

    if category:
        if category not in ALLOWED_CATEGORIES:
            return validation_error({
                "category": "Kategori tidak valid"
            })
        query = query.filter(Memory.category == category)

    memories = query.order_by(
        Memory.memory_date.desc(),
        Memory.id.desc()
    ).all()

    return jsonify([memory_to_dict(m) for m in memories]), 200


@app.get("/api/memories/<int:memory_id>")
def get_memory(memory_id):
    memory = db.session.get(Memory, memory_id)

    if memory is None:
        return jsonify({"error": "Memory tidak ditemukan"}), 404

    return jsonify(memory_to_dict(memory)), 200


@app.post("/api/memories")
def create_memory():
    data = request.get_json(silent=True)
    cleaned, details = validate_memory_data(data)

    if details:
        return validation_error(details)

    memory = Memory(**cleaned)

    try:
        db.session.add(memory)
        db.session.commit()
        return jsonify(memory_to_dict(memory)), 201
    except Exception:
        db.session.rollback()
        app.logger.exception("Failed to create memory")
        return jsonify({"error": "Gagal menyimpan memory"}), 500


@app.put("/api/memories/<int:memory_id>")
def update_memory(memory_id):
    if not verify_admin_pin():
        return jsonify({"error": "PIN Admin salah atau tidak valid"}), 401
    
    memory = db.session.get(Memory, memory_id)

    if memory is None:
        return jsonify({"error": "Memory tidak ditemukan"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return validation_error({
            "body": "Body harus berupa JSON object yang tidak kosong"
        })

    cleaned, details = validate_memory_data(data, partial=True)

    if details:
        return validation_error(details)

    for field, value in cleaned.items():
        setattr(memory, field, value)

    try:
        db.session.commit()
        return jsonify(memory_to_dict(memory)), 200
    except Exception:
        db.session.rollback()
        app.logger.exception("Failed to update memory")
        return jsonify({"error": "Gagal memperbarui memory"}), 500


@app.delete("/api/memories/<int:memory_id>")
def delete_memory(memory_id):
    if not verify_admin_pin():
        return jsonify({"error": "PIN Admin salah atau tidak valid"}), 401
    
    memory = db.session.get(Memory, memory_id)

    if memory is None:
        return jsonify({"error": "Memory tidak ditemukan"}), 404

    deleted_memory = memory_to_dict(memory)

    try:
        db.session.delete(memory)
        db.session.commit()
        return jsonify(deleted_memory), 200
    except Exception:
        db.session.rollback()
        app.logger.exception("Failed to delete memory")
        return jsonify({"error": "Gagal menghapus memory"}), 500



if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000, debug=True)
    