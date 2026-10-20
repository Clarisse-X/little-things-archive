
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func

db = SQLAlchemy()


class Memory(db.Model):
    __tablename__ = "memories"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    story = db.Column(db.Text, nullable=False)
    memory_date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    happiness_level = db.Column(db.Integer, nullable=False)
    photo_path = db.Column(db.String(255), nullable=True)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=func.now()
    )
