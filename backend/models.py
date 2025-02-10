from db import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    # additional fields as needed

class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80))
    task_id = db.Column(db.String(20))
    row_data = db.Column(db.Text)  # JSON serialized table row
    error_type = db.Column(db.String(50))
    span_start = db.Column(db.Integer)
    span_end = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80))
    entry_id = db.Column(db.String(20))
    row_data = db.Column(db.Text)  # JSON serialized table row
    question = db.Column(db.String(256))
    feedback = db.Column(db.Text)
    rating = db.Column(db.Integer)
    thumbs_up = db.Column(db.Integer, default=0)
    thumbs_down = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
