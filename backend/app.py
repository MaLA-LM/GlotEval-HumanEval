import os, json, bcrypt, importlib, sys
from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
from config import Config
from db import db
from models import User, Annotation, Comment
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from deep_translator import GoogleTranslator
import secrets

# Check and generate secret key if needed
def ensure_secret_key():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path) or 'SECRET_KEY' not in os.environ:
        # Generate a random 24-byte hex string
        secret_key = secrets.token_hex(24)
        with open(env_path, 'w') as f:
            f.write(f"SECRET_KEY={secret_key}")
        os.environ['SECRET_KEY'] = secret_key

# Ensure secret key exists before app initialization
ensure_secret_key()

app = Flask(__name__)
app.config.from_object(Config)
app.config['SESSION_COOKIE_SECURE'] = True  # Only send cookies over HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access to cookies
app.config['SESSION_COOKIE_SAMESITE'] = 'Strict'  # CSRF protection
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)  # Session expires in 8 hours

# Server start timestamp to invalidate old sessions
SERVER_START_TIME = datetime.utcnow()

# Clear all sessions at server start
with app.app_context():
    try:
        session.clear()
    except:
        pass  # Ignore any session errors during startup

CORS(app, supports_credentials=True)
db.init_app(app)

# Configure CORS
CORS(app, supports_credentials=True)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Create database tables if they do not exist
with app.app_context():
    db.create_all()

### Authentication endpoints ###
@app.route("/api/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({"error": "Missing credentials"}), 400
            
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400
            
        # Check if username already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400
            
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        new_user = User(username=username, password=hashed.decode("utf-8"))
        
        db.session.add(new_user)
        db.session.commit()
        
        # Set new session
        session.clear()
        session["username"] = username
        session["login_time"] = datetime.utcnow()
        session.permanent = True
        return jsonify({"message": "User created", "username": username}), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error in signup: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({"error": "Missing credentials"}), 400
            
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
            
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401
            
        # Set new session
        session.clear()
        session["username"] = username
        session["login_time"] = datetime.utcnow()
        session.permanent = True
        return jsonify({"message": "Logged in", "username": username}), 200
        
    except Exception as e:
        app.logger.error(f"Error in login: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route("/api/logout", methods=["POST"])
def logout():
    try:
        session.clear()  # Clear the entire session instead of just removing username
        return jsonify({"message": "Logged out"}), 200
    except Exception as e:
        app.logger.error(f"Error in logout: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route("/api/verify-session", methods=["GET"])
def verify_session():
    try:
        if "username" not in session or "login_time" not in session:
            return jsonify({"error": "Not authenticated"}), 401
            
        # Check if session was created before server start
        login_time = session.get("login_time")
        if isinstance(login_time, str):
            login_time = datetime.fromisoformat(login_time)
        if login_time < SERVER_START_TIME:
            session.clear()
            return jsonify({"error": "Session expired"}), 401
            
        # Verify the user still exists in the database
        user = User.query.filter_by(username=session["username"]).first()
        if not user:
            session.clear()
            return jsonify({"error": "User not found"}), 401
            
        return jsonify({"message": "Session valid", "username": session["username"]}), 200
        
    except Exception as e:
        app.logger.error(f"Error in verify_session: {str(e)}")
        session.clear()
        return jsonify({"error": "An unexpected error occurred"}), 500

# Configure session to last for 24 hours
app.permanent_session_lifetime = timedelta(days=1)

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


@app.route("/api/feedback", methods=["POST"])
def get_feedback():
    data = request.json
    entry_id = data.get('entry_id')
    username = data.get('username')
    
    if not entry_id or not username:
        return jsonify({"error": "Missing entry_id or username"}), 400
        
    comment = Comment.query.filter_by(
        entry_id=entry_id,
        username=username
    ).first()
    
    if not comment:
        return jsonify({"message": "No feedback found"}), 404
        
    return jsonify({
        "id": comment.id,
        "username": comment.username,
        "entry_id": comment.entry_id,
        "question": comment.question,
        "comment": comment.feedback,
        "rating": comment.rating,
        "timestamp": comment.timestamp.isoformat()
    })

# Configure upload and output directories
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'outputs')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# Ensure directories exist
for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

def load_python_evaluator(filepath):
    spec = importlib.util.spec_from_file_location("evaluator", filepath)
    module = importlib.util.module_from_spec(spec)
    sys.modules["evaluator"] = module
    spec.loader.exec_module(module)
    return module.evaluate

def process_evaluation(evaluator_path, jsonl_path):
    try:
        # Load the appropriate evaluator based on file extension
        if evaluator_path.endswith('.py'):
            evaluate_func = load_python_evaluator(evaluator_path)
        elif evaluator_path.endswith('.js'):
            evaluate_func = load_javascript_evaluator(evaluator_path)
        else:
            raise ValueError("Unsupported evaluator file type")
        
        results = []
        # Process each line in the JSONL file
        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    json_data = json.loads(line.strip())
                    # Evaluate the data
                    if evaluator_path.endswith('.py'):
                        result = evaluate_func(json_data)
                    else:
                        # Handle JavaScript evaluation
                        result = {"error": "JavaScript evaluation not yet implemented"}
                    results.append(result)
                except json.JSONDecodeError:
                    results.append({"error": "Invalid JSON line"})
                except Exception as e:
                    results.append({"error": f"Evaluation error: {str(e)}"})
        
        # Save results to output file
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], 'evaluation_results.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
        
        return {
            "message": "Evaluation completed successfully",
            "results": results,
            "output_file": "evaluation_results.json"
        }
        
    except Exception as e:
        raise Exception(f"Error during evaluation: {str(e)}")

@app.route('/api/evaluator/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    if request.method == "OPTIONS":
        return jsonify({"msg": "ok"}), 200
    
    # Check if required fields are present
    if 'evaluator' not in request.files:
        return jsonify({"error": "Evaluator file is required"}), 400
    
    if not all(field in request.form for field in ['benchmark', 'model', 'language']):
        return jsonify({"error": "Benchmark, model, and language are required"}), 400
    
    evaluator_file = request.files['evaluator']
    benchmark = request.form['benchmark']
    model = request.form['model']
    language = request.form['language']
    
    # Check if evaluator file is selected
    if evaluator_file.filename == '':
        return jsonify({"error": "No evaluator file selected"}), 400
    
    # Validate evaluator file extension
    if not (evaluator_file.filename.endswith('.py') or evaluator_file.filename.endswith('.js')):
        return jsonify({"error": "Evaluator must be a .py or .js file"}), 400
    
    try:
        # Save the evaluator file
        evaluator_path = os.path.join(app.config['UPLOAD_FOLDER'], 'evaluator' + os.path.splitext(evaluator_file.filename)[1])
        evaluator_file.save(evaluator_path)
        
        # Construct the path to the JSONL file in frontend/public directory
        jsonl_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                'frontend',
                                'public', 
                                benchmark, 
                                'outputs',
                                model,
                                f'{language}.jsonl')
        
        if not os.path.exists(jsonl_path):
            return jsonify({"error": f"JSONL file not found at path: {jsonl_path}"}), 404
        
        # Process the files and get results
        results = process_evaluation(evaluator_path, jsonl_path)
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    with app.app_context(): 
        root_dir = os.path.join(Config.DATA_DIR,"outputs")
        generate_index_json(root_dir)

    app.run(debug=True)
