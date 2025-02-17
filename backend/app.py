import os, json, bcrypt
from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
from config import Config
from db import db
from models import User, Annotation, Comment
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from deep_translator import GoogleTranslator

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, supports_credentials=True)
db.init_app(app)

# Create database tables if they do not exist
with app.app_context():
    db.create_all()

### Authentication endpoints ###
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(username=username, password=hashed.decode("utf-8"))
    try:
        db.session.add(new_user)
        db.session.commit()
        session["username"] = username
        return jsonify({"message": "User created", "username": username}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Username already exists"}), 400

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        session["username"] = username
        return jsonify({"message": "Logged in", "username": username}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("username", None)
    return jsonify({"message": "Logged out"}), 200

### Task configuration endpoint ###
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    app.logger.info("Received /api/tasks request")
    try:
        with open(Config.TASKS_FILE) as f:
            tasks = json.load(f)
        return jsonify(tasks)
    except Exception as e:
        app.logger.error(f"Error loading tasks: {str(e)}")
        return jsonify({"error": str(e)}), 500



### Data loading endpoint (reads jsonl file based on selection) ###
@app.route("/api/data", methods=["POST"])
def get_data():
    data = request.json
    task_type = data.get("task")
    benchmark = data.get("benchmark")
    model = data.get("model")
    language = data.get("language")

    if not all([task_type, benchmark, model, language]):
        return jsonify({"error": "Missing one or more required parameters: task, benchmark, model, language."}), 400

    try:
        with open(Config.TASKS_FILE) as f:
            tasks = json.load(f)
    except Exception as e:
        return jsonify({"error": f"Failed to load tasks configuration: {str(e)}"}), 500

    try:
        task_config = tasks[task_type]
    except KeyError:
        return jsonify({"error": f"Task '{task_type}' not found in configuration."}), 400
    try:
        benchmark_models = task_config[benchmark]
    except KeyError:
        return jsonify({"error": f"Benchmark '{benchmark}' not found for task '{task_type}'."}), 400
    try:
        model_config = benchmark_models[model]
    except KeyError:
        return jsonify({"error": f"Model '{model}' not found under benchmark '{benchmark}' for task '{task_type}'."}), 400
    try:
        file_path = os.path.join("outputs",benchmark,model,f"{language}.jsonl")
        
    except KeyError:
        return jsonify({"error": f"Language '{language}' not found for model '{model}' under benchmark '{benchmark}' for task '{task_type}'."}), 400

    full_path = os.path.join(Config.DATA_DIR, file_path)
    if not os.path.exists(full_path):
        return jsonify({"error": f"Data file not found: {full_path}"}), 404

    table_data = []
    try:
        with open(full_path, "r", encoding="utf-8") as f:
            for idx, line in enumerate(f):
                try:
                    row = json.loads(line)
                except json.JSONDecodeError:
                    continue
                # Create entry_id using the new naming convention.
                entry_id = f"{task_type.lower()}-{benchmark.lower()}-{model.lower()}-{language}-{str(idx+1).zfill(4)}"
                row["entry_id"] = entry_id
                table_data.append(row)
    except Exception as e:
        return jsonify({"error": f"Error reading file: {str(e)}"}), 500

    return jsonify(table_data)



### Annotation endpoint ###
@app.route("/api/annotation", methods=["POST"])
def save_annotation():
    if "username" not in session:
        return jsonify({"error": "Authentication required"}), 401
    data = request.json
    username = session["username"]
    # Expecting data to contain an "annotations" array
    annotations = data.get("annotations")
    if annotations and isinstance(annotations, list):
        saved_annotations = []
        for ann in annotations:
            # If error type is missing, skip (or you can decide to throw an error)
            if ann.get("errorType") is None:
                continue
            new_ann = Annotation(
                username=username,
                entry_id=data.get("entry_id"),
                row_data=json.dumps(data.get("row_data")),
                error_type=ann.get("errorType"),
                span_start=ann.get("start", 0),
                span_end=ann.get("end", 0),
                timestamp=datetime.utcnow()
            )
            db.session.add(new_ann)
            saved_annotations.append(new_ann)
        try:
            db.session.commit()
            return jsonify({"message": f"{len(saved_annotations)} annotations saved."})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    else:
        # Fallback: if annotations array is not provided, try saving a single annotation.
        new_ann = Annotation(
            username=username,
            entry_id=data.get("entry_id"),
            row_data=json.dumps(data.get("row_data")),
            error_type=data.get("error_type"),
            span_start=data.get("span", [0, 0])[0],
            span_end=data.get("span", [0, 0])[1],
            timestamp=datetime.utcnow()
        )
        db.session.add(new_ann)
        try:
            db.session.commit()
            return jsonify({"message": "Annotation saved", "id": new_ann.id})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500


### Comments endpoints ###
@app.route("/api/comments", methods=["GET"])
def get_comments():
    # You can filter by entry_id if needed.
    comments = Comment.query.order_by(Comment.timestamp.desc()).all()
    out = []
    for comment in comments:
        out.append({
            "id": comment.id,
            "username": comment.username,
            "entry_id": comment.entry_id,
            "row_data": json.loads(comment.row_data),
            "question": comment.question,
            "feedback": comment.feedback,
            "rating": comment.rating,
            "thumbs_up": comment.thumbs_up,
            "thumbs_down": comment.thumbs_down,
            "timestamp": comment.timestamp.isoformat()
        })
    return jsonify(out)

@app.route("/api/comments", methods=["POST"])
def add_comment():
    if "username" not in session:
        return jsonify({"error": "Authentication required"}), 401
    data = request.json
    username = session["username"]
    comment = Comment(
        username=username,
        entry_id=data.get("entry_id"),
        row_data=json.dumps(data.get("row_data")),
        question=data.get("question"),
        feedback=data.get("feedback"),
        rating=data.get("rating"),
        timestamp=datetime.utcnow()
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({"message": "Comment added", "id": comment.id})


@app.route("/api/comments/<int:comment_id>", methods=["PUT"])
def edit_comment(comment_id):
    if "username" not in session:
        return jsonify({"error": "Authentication required"}), 401
    data = request.json
    comment = Comment.query.get_or_404(comment_id)
    if comment.username != session["username"]:
        return jsonify({"error": "Permission denied"}), 403
    comment.question = data.get("question", comment.question)
    comment.feedback = data.get("feedback", comment.feedback)
    comment.rating = data.get("rating", comment.rating)
    db.session.commit()
    return jsonify({"message": "Comment updated"})

@app.route("/api/comments/<int:comment_id>", methods=["DELETE"])
def delete_comment(comment_id):
    if "username" not in session:
        return jsonify({"error": "Authentication required"}), 401
    comment = Comment.query.get_or_404(comment_id)
    if comment.username != session["username"]:
        return jsonify({"error": "Permission denied"}), 403
    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Comment deleted"})

@app.route("/api/comments/thumbs", methods=["POST"])
def thumbs():
    data = request.json
    comment_id = data.get("comment_id")
    vote_type = data.get("vote_type")  # "up" or "down"
    comment = Comment.query.get_or_404(comment_id)
    if vote_type == "up":
        comment.thumbs_up += 1
    elif vote_type == "down":
        comment.thumbs_down += 1
    else:
        return jsonify({"error": "Invalid vote"}), 400
    db.session.commit()
    return jsonify({"message": "Vote recorded"})

### Export endpoint ###
@app.route("/api/export", methods=["GET"])
def export_data():
    # Exports both annotations and comments as a JSON file.
    annotations = Annotation.query.all()
    comments = Comment.query.all()
    ann_out = [{
        "username": a.username,
        "entry_id": a.entry_id,
        "row_data": json.loads(a.row_data),
        "error_type": a.error_type,
        "span": [a.span_start, a.span_end],
        "timestamp": a.timestamp.isoformat()
    } for a in annotations]
    com_out = [{
        "username": c.username,
        "entry_id": c.entry_id,
        "row_data": json.loads(c.row_data),
        "question": c.question,
        "feedback": c.feedback,
        "rating": c.rating,
        "thumbs_up": c.thumbs_up,
        "thumbs_down": c.thumbs_down,
        "timestamp": c.timestamp.isoformat()
    } for c in comments]
    out = {"annotations": ann_out, "comments": com_out}
    export_path = os.path.join(Config.BASE_DIR, "export.json")
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    return send_file(export_path, as_attachment=True)



SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh-CN': 'Chinese',
    'ja': 'Japanese'
}

@app.route('/api/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        text = data.get('text')
        target_lang = data.get('target_lang', 'en')
        
        if not text:
            return jsonify({"error": "No text provided for translation"}), 400
            
        if target_lang not in SUPPORTED_LANGUAGES:
            return jsonify({"error": f"Unsupported target language: {target_lang}"}), 400

        # Split text into smaller chunks if needed (Google Translate has character limits)
        chunks = [text[i:i+4500] for i in range(0, len(text), 4500)]
        
        translator = GoogleTranslator(source='auto', target=target_lang)
        translated_chunks = []
        
        for chunk in chunks:
            try:
                translated = translator.translate(chunk)
                translated_chunks.append(translated)
            except Exception as e:
                print(f"Translation error for chunk: {str(e)}")
                return jsonify({"error": "Failed to detect the source language"}), 500

        translated_text = ' '.join(translated_chunks)
        
        return jsonify({
            "translated_text": translated_text,
            "target_lang": target_lang
        })
        
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return jsonify({"error": "Translation failed"}), 500


TASK_BENCHMARK_MAP = {
"Classification": ["SIB-200","Taxi-1500"],
"Translation": ["Flores200 Eng-X","Flores200 X-Eng"],
"Summarization": ["XLSum"],
"Generation": ["Aya","PolyWrite"]
}
    
    # Function to scan directory and update database
def generate_index_json(root_dir):
    """Sync the database with the directory structure."""
    with app.app_context():
        index = {}
        for task_type, benchmarks in TASK_BENCHMARK_MAP.items():
            index[task_type] = {}  # initialize task_type
            
            for benchmark in benchmarks:
                benchmark_path = os.path.join(root_dir, benchmark)
                index[task_type][benchmark] = {}  # initialize benchmark

                if not os.path.exists(benchmark_path):
                    continue

                # handle the translation task differently
                if task_type == "translation":
                    for lang_type_folder in os.listdir(benchmark_path):
                        lang_path = os.path.join(benchmark_path, lang_type_folder)
                        if not os.path.isdir(lang_path):
                            continue

                        for model in os.listdir(lang_path):
                            model_path = os.path.join(lang_path, model)
                            if not os.path.isdir(model_path):
                                continue

                            index[task_type][benchmark][model] = []
                            for file in os.listdir(model_path):
                                if file.endswith(".jsonl"):
                                    language = file.replace(".jsonl", "")
                                    index[task_type][benchmark][model].append(language)

                else:
                    # handle other task type
                    for model in os.listdir(benchmark_path):
                        model_path = os.path.join(benchmark_path, model)
                        if not os.path.isdir(model_path):
                            continue

                        index[task_type][benchmark][model] = []
                        for file in os.listdir(model_path):
                            if file.endswith(".jsonl"):
                                language = file.replace(".jsonl", "")
                                index[task_type][benchmark][model].append(language)
            
    with open(Config.TASKS_FILE , "w") as f:
        json.dump(index, f, indent=4)


if __name__ == "__main__":
    with app.app_context(): 
        root_dir = os.path.join(Config.DATA_DIR,"outputs")
        generate_index_json(root_dir)

    app.run(debug=True)
