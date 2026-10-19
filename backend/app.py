
import os
from datetime import date

from flask import Flask, jsonify, request
from models import db, Memory

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/little_things"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


def memory_to_dict(memory):
    return {
        "id": memory.id,
        "title": memory.title,
        "story": memory.story,
        "memory_date": memory.memory_date.isoformat(),
        "category": memory.category,
        "happiness_level": memory.happiness_level,
        "photo_path": memory.photo_path
    }


@app.get("/")
def home():
    return jsonify({"message": "Little Things Archive API is running!"})


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "little-things-archive-api"
    }), 200


# READ: Get all memories
@app.get("/api/memories")
def get_memories():
    memories = Memory.query.order_by(Memory.memory_date.desc()).all()
    return jsonify([memory_to_dict(m) for m in memories]), 200


# READ: Get one memory
@app.get("/api/memories/<int:memory_id>")
def get_memory(memory_id):
    memory = db.session.get(Memory, memory_id)

    if memory is None:
        return jsonify({"error": "Memory not found"}), 404

    return jsonify(memory_to_dict(memory)), 200


# CREATE: Add a memory
@app.post("/api/memories")
def create_memory():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be JSON"}), 400

    title = data.get("title")
    story = data.get("story")
    memory_date = data.get("memory_date")
    category = data.get("category")
    level = data.get("happiness_level")

    if not all([title, story, memory_date, category]):
        return jsonify({
            "error": "title, story, memory_date, and category are required"
        }), 400

    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "title must be a non-empty string"}), 400

    if not isinstance(story, str) or not story.strip():
        return jsonify({"error": "story must be a non-empty string"}), 400

    try:
        parsed_date = date.fromisoformat(memory_date)
    except (ValueError, TypeError):
        return jsonify({"error": "memory_date must use YYYY-MM-DD format"}), 400

    if not isinstance(category, str) or not category.strip():
        return jsonify({"error": "category must be a non-empty string"}), 400

    if type(level) is not int or not 1 <= level <= 5:
        return jsonify({"error": "happiness_level must be an integer from 1 to 5"}), 400

    memory = Memory(
        title=title.strip(),
        story=story.strip(),
        memory_date=parsed_date,
        category=category.strip(),
        happiness_level=level,
        photo_path=None
    )

    db.session.add(memory)
    db.session.commit()

    return jsonify(memory_to_dict(memory)), 201


# UPDATE: Edit a memory
@app.put("/api/memories/<int:memory_id>")
def update_memory(memory_id):
    memory = db.session.get(Memory, memory_id)

    if memory is None:
        return jsonify({"error": "Memory not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Request body must be a non-empty JSON object"}), 400

    if "title" in data:
        if not isinstance(data["title"], str) or not data["title"].strip():
            return jsonify({"error": "Invalid title"}), 400
        memory.title = data["title"].strip()

    if "story" in data:
        if not isinstance(data["story"], str) or not data["story"].strip():
            return jsonify({"error": "Invalid story"}), 400
        memory.story = data["story"].strip()

    if "memory_date" in data:
        try:
            memory.memory_date = date.fromisoformat(data["memory_date"])
        except (ValueError, TypeError):
            return jsonify({"error": "memory_date must use YYYY-MM-DD format"}), 400

    if "category" in data:
        if not isinstance(data["category"], str) or not data["category"].strip():
            return jsonify({"error": "Invalid category"}), 400
        memory.category = data["category"].strip()

    if "happiness_level" in data:
        level = data["happiness_level"]
        if type(level) is not int or not 1 <= level <= 5:
            return jsonify({"error": "happiness_level must be an integer from 1 to 5"}), 400
        memory.happiness_level = level

    db.session.commit()
    return jsonify(memory_to_dict(memory)), 200


# DELETE: Remove a memory
@app.delete("/api/memories/<int:memory_id>")
def delete_memory(memory_id):
    memory = db.session.get(Memory, memory_id)

    if memory is None:
        return jsonify({"error": "Memory not found"}), 404

    db.session.delete(memory)
    db.session.commit()

    return jsonify({"message": "Memory deleted successfully"}), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=5000)

