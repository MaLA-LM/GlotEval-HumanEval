# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuration
app.config['SECRET_KEY'] = '8f42a73737ns4akjs9f8f58845e6502c'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///review_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    comments = db.relationship('Comment', backref='author', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, nullable=False)
    task_type = db.Column(db.String(50), nullable=False)
    input_text = db.Column(db.Text, nullable=False)
    output_text = db.Column(db.Text, nullable=False)
    comment_text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            token = token.split()[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'token': token,
            'username': user.username,
            'message': 'Login successful'
        }), 200
    
    return jsonify({'message': 'Invalid username or password'}), 401

@app.route('/api/comments', methods=['GET', 'POST'])
@token_required
def handle_comments(current_user):
    if request.method == 'POST':
        data = request.get_json()
        
        comment = Comment(
            task_id=data['taskId'],
            task_type=data['taskType'],
            input_text=data['input'],
            output_text=data['output'],
            comment_text=data['comment'],
            user_id=current_user.id
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({'message': 'Comment saved successfully'}), 201
    
    # GET request
    comments = Comment.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': c.id,
        'taskId': c.task_id,
        'taskType': c.task_type,
        'input': c.input_text,
        'output': c.output_text,
        'comment': c.comment_text,
        'timestamp': c.timestamp.isoformat(),
        'username': current_user.username
    } for c in comments])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)