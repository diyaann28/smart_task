from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
# from openai import OpenAI
# import os
# from dotenv import load_dotenv

# ──────────────────────────────────────────────
# Flask + DB basic setup
# ──────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = "tasktracker123"
CORS(app, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
db = SQLAlchemy(app)

def current_user_id():
    return session.get('user_id')



# ──────────────────────────────────────────────
# OpenAI setup  (put your key in an env var)
# ──────────────────────────────────────────────

# load_dotenv()
# api_key = os.getenv("OPENAI_API_KEY")
# print("🔑 Loaded key starts with:", api_key[:10] if api_key else "None")
# client = OpenAI(api_key=api_key)

def suggest_priority(title: str) -> str:
    
    # Very‑simple keyword rules:
    #   • High  → urgent, deadline‑related, payments, meetings, finals…
    #   • Low   → leisure / errands
    #   • Medium (explicit list) → routine work; otherwise default
    
    HIGH_KEYWORDS = {
        "urgent", "asap", "immediately", "today", "deadline", "due",
        "submit", "finish", "complete", "final", "report", "presentation",
        "project", "deliver", "review", "meeting", "appointment", "call",
        "pay", "payment", "invoice", "exam", "test"
    }

    LOW_KEYWORDS = {
        "buy", "order", "snack", "snacks", "groceries", "shopping",
        "play", "game", "watch", "movie", "series", "tv", "read",
        "walk", "stroll", "relax", "chill", "laundry", "organize", "clean"
    }

    MEDIUM_KEYWORDS = {
        "email", "emails", "check", "update", "plan", "schedule",
        "follow‑up", "research", "draft", "note", "reminder"
    }

    title_lower = title.lower()

    if any(word in title_lower for word in HIGH_KEYWORDS):
        return "High"
    if any(word in title_lower for word in LOW_KEYWORDS):
        return "Low"
    if any(word in title_lower for word in MEDIUM_KEYWORDS):
        return "Medium"

    # default if nothing matched
    return "Medium"

# def suggest_priority(title: str) -> str:
#     try:
#         prompt = (
#             "Classify the following task with exactly one word: High, Medium, or Low.\n"
#             f"Task: {title}\nPriority:"
#         )

#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",  
#             messages=[
#                 {"role": "user", "content": prompt}
#             ],
#             max_tokens=3,
#             temperature=0
#         )

#         answer = response.choices[0].message.content.strip().lower()
#         print(" AI said:", answer)

#         if "high" in answer:
#             return "High"
#         elif "medium" in answer:
#             return "Medium"
#         elif "low" in answer:
#             return "Low"

#     except Exception as e:
#         print(" OpenAI error:", e)

#     return "Medium"  # fallback if anything fails


class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    pwd_hash = db.Column(db.String(200), nullable=False)

    def check_pwd(self, pwd):
        return check_password_hash(self.pwd_hash, pwd)


# ──────────────────────────────────────────────
# Task model
# ──────────────────────────────────────────────

class Task(db.Model):
    id        = db.Column(db.Integer, primary_key=True)
    title     = db.Column(db.String(120))
    category  = db.Column(db.String(50))
    completed = db.Column(db.Boolean, default=False)
    priority  = db.Column(db.String(10))
    user_id   = db.Column(db.Integer, db.ForeignKey('user.id'))   # NEW
    user      = db.relationship('User', backref='tasks')          # (optional)
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "completed": self.completed,
            "priority": self.priority
        }

with app.app_context():
    db.create_all()

# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────
# ── NEW ❷  Register route ─────────────────────────────────
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data.get("username") or not data.get("password"):
        return jsonify({"success": False, "msg": "Missing fields"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"success": False, "msg": "Username exists"}), 400

    user = User(
        username=data['username'],
        pwd_hash=generate_password_hash(data['password'])
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"success": True})

# ── NEW ❸  Login route ────────────────────────────────────
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get("username")).first()
    if user and user.check_pwd(data.get("password")):
        session['user_id'] = user.id          # 🔵 set cookie session id
        return jsonify({"success": True})
    return jsonify({"success": False, "msg": "Invalid credentials"}), 401

# ── NEW ❹  Logout route (optional) ─────────────────────────
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"success": True})

# ── keep your /tasks routes as-is (optionally protect them) ─


@app.route('/tasks', methods=['GET', 'POST'])
def handle_tasks():
    if 'user_id' not in session:
        return jsonify({"msg": "Login required"}), 401

    if request.method == 'POST':
        data = request.json
        task = Task(
            title     = data['title'],
            category  = data.get('category', ''),
            completed = False,
            priority  = suggest_priority(data['title']),
            user_id   = current_user_id()          # ← link task to user
        )
        db.session.add(task)
        db.session.commit()
        return jsonify(task.to_dict()), 201

    # GET only tasks that belong to this user
    tasks = Task.query.filter_by(user_id=current_user_id()).all()
    return jsonify([t.to_dict() for t in tasks])


@app.route('/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
def modify_task(task_id):
    if 'user_id' not in session:
        return jsonify({"msg": "Login required"}), 401

    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user_id():
        return jsonify({"msg": "Forbidden"}), 403  # disallow touching others’ tasks

    if request.method == 'PUT':
        data = request.json
        task.title     = data.get('title', task.title)
        task.category  = data.get('category', task.category)
        task.completed = data.get('completed', task.completed)
        task.priority  = data.get('priority', task.priority)
        db.session.commit()
        return jsonify(task.to_dict())

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})

# ──────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True)


