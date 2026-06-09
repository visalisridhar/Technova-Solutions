# PROJECT_EXPLANATION.md
# TechNova Solutions — Complete Study Guide

> Use this file to prepare for your project submission and viva. Read it top to bottom once, then use it as a quick-reference on the day.

---

## What is This Project? (30-Second Pitch)

> "TechNova Solutions is a full-stack business website built with Python Flask. It has six public pages for a fictional tech company, a contact form that saves enquiries to a SQLite database, and a secure admin panel where the admin can log in, view all enquiries, and delete them. There's also a JavaScript chatbot on every page that answers FAQs."

---

## The Big Picture

```
Visitor opens browser
       │
       ▼
Flask serves HTML page (Jinja2 renders variables)
       │
       ▼
Visitor fills contact form → POST /contact → Flask saves to SQLite
       │
       ▼
Admin visits /login → enters admin/password → session cookie set
       │
       ▼
Admin visits /admin (dashboard) → /messages (inbox) → /delete/id
```

---

## Technology Stack — One Line Each

| What | Technology | Why |
|---|---|---|
| Backend language | Python 3 | Readable, beginner-friendly, huge ecosystem |
| Web framework | Flask | Lightweight, manual control, good for learning |
| Database | SQLite | File-based, no server needed, built into Python |
| ORM | Flask-SQLAlchemy | Write Python instead of raw SQL |
| Templating | Jinja2 | Inject Python variables into HTML |
| Frontend | HTML5 + CSS3 + JS | Standard web technologies, no build step |
| Email | smtplib | Built into Python, no extra package |

---

## File Map

```
app.py              ← The brain — routes, models, auth logic
styles.css          ← All CSS for every page
chatbot.js          ← Self-contained chatbot widget
index.html          ← Home page (public)
about.html          ← About page (public)
services.html       ← Services page (public)
projects.html       ← Projects page (public)
gallery.html        ← Gallery page (public)
contact.html        ← Contact form (public) — POST saves to DB
login.html          ← Admin login (public) — POST checks credentials
admin.html          ← Admin dashboard (PROTECTED)
messages.html       ← Admin inbox (PROTECTED)
instance/
  business.db       ← SQLite database (auto-created on first run)
project-documentation/
  1-project-overview.md         ← What / why / who
  2-system-architecture.md      ← Diagrams + layers
  3-technology-stack.md         ← Each tech explained in depth
  4-database-documentation.md   ← Schema, SQL, ER diagram
  5-source-code-explanation.md  ← app.py line-by-line
  6-application-workflow.md     ← Flowcharts for every feature
  7-api-documentation.md        ← Every route documented
  8-development-process.md      ← Setup, config, deployment
  9-testing-documentation.md    ← Test cases + limitations
  10-viva-preparation.md        ← Q&A with model answers
  12-project-report.md          ← Full academic report
```

---

## Database (memorise this)

**One table: `contact`**

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Auto-increments — DB assigns it |
| `name` | VARCHAR(100) | Visitor's name |
| `email` | VARCHAR(100) | Visitor's email |
| `subject` | VARCHAR(200) | Enquiry subject |
| `message` | TEXT | Enquiry body — unlimited length |

**How it's created:** `db.create_all()` runs at startup. If table exists → does nothing. If not → creates it.

**How data gets in:** Visitor submits contact form → `db.session.add(Contact(...))` → `db.session.commit()` → row written to `business.db`.

**How admin reads it:** `Contact.query.order_by(Contact.id.desc()).all()` → returns newest first.

**How admin deletes:** `Contact.query.get(id)` → `db.session.delete(msg)` → `db.session.commit()`.

---

## Authentication Flow (memorise this)

```
1. Admin visits /login
2. Enters username="admin", password="password"
3. Browser sends POST /login with form data
4. Flask reads: request.form['username'], request.form['password']
5. Compares with ADMIN_USERNAME='admin', ADMIN_PASSWORD='password'
6. Match → session['logged_in'] = True (stored in encrypted cookie)
7. Redirect 302 to /admin

8. Admin visits /admin
9. @login_required decorator runs FIRST
10. Checks session.get('logged_in')
11. True → allow access to /admin route
12. False / missing → redirect to /login

13. Admin clicks Log out
14. /logout route runs session.clear()
15. Redirect to /login
```

---

## login_required Decorator — Explained Simply

```python
def login_required(f):          # f = the route function being wrapped
    @functools.wraps(f)          # preserves original function name
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))   # not logged in → go to /login
        return f(*args, **kwargs)               # logged in → run the original route
    return decorated
```

**Used on:** `@app.route('/admin')`, `@app.route('/messages')`, `@app.route('/delete/<id>')`

**Why a decorator?** Avoids copying the same auth check into every protected route. One place to change = consistent behaviour everywhere.

---

## Contact Form Flow (memorise this)

```
1. Visitor fills HTML form (name, email, subject, message)
2. <form method="POST" action="/contact"> — sends to Flask
3. Flask: name = request.form.get('name'), etc.
4. Creates Contact object: Contact(name=name, email=email, ...)
5. db.session.add(contact_object)
6. db.session.commit()  ← writes to SQLite file
7. Try to send email (SMTP) — if fails: except Exception: pass (silent)
8. return render_template("contact.html", success=True)
9. Jinja2: {% if success %} → shows success toast to visitor
```

---

## Jinja2 Templating — Quick Reference

| Syntax | Meaning | Example |
|---|---|---|
| `{{ variable }}` | Output a Python value | `{{ total_messages }}` |
| `{% if condition %}` | Conditional block | `{% if error %}` |
| `{% for item in list %}` | Loop | `{% for msg in messages %}` |
| `{% endif %}` | End if block | |
| `{% endfor %}` | End for loop | |
| `{{ msg.name[0] \| upper }}` | Filter — uppercase first char | |

**Why raw `{{ }}` appeared in browser before:** Pages were opened as `.html` static files, bypassing Flask. Flask must serve them at `http://localhost:5000/admin` for Jinja2 to process.

---

## Chatbot (chatbot.js) — How It Works

1. Script tag on every page: `<script src="chatbot.js"></script>`
2. IIFE auto-runs on page load — no function call needed
3. Injects own HTML (chat bubble, panel, messages) into DOM
4. FAQ array: `[{keywords: ['pricing','cost'], answer: '...'}, ...]`
5. User types → lowercased → checked against each FAQ's keywords array
6. First keyword match → show that FAQ's answer
7. No match → show fallback message: "I'd recommend contacting us directly..."
8. **No server requests** — entirely client-side JavaScript

---

## Environment Variables — Why They Matter

| Variable | Default (fallback) | Override for production |
|---|---|---|
| `SECRET_KEY` | `technova-secret-2025` | Set a long random string |
| `MAIL_TO` | `admin@technova.com` | Real admin email |
| `SMTP_SERVER` | `smtp.gmail.com` | Your SMTP host |
| `SMTP_PORT` | `587` | Your SMTP port |
| `SMTP_USER` | *(empty)* | Your email address |
| `SMTP_PASS` | *(empty)* | Your app password |

Read in code as: `os.environ.get('SECRET_KEY', 'technova-secret-2025')`

**Why?** Secrets must never be hardcoded in source code. Environment variables keep them out of the codebase and out of git history.

---

## GET vs POST — Simple Rule

| Method | Used for | In this project |
|---|---|---|
| GET | Loading pages, reading data | All nav links, /admin, /messages |
| POST | Sending data to server | /contact (form), /login (form) |

POST data goes in the **request body** (hidden from URL bar). GET data goes in the **URL** (visible).

---

## MVC Pattern in This Project

| MVC Layer | What it is | In this project |
|---|---|---|
| Model | Data structure | `Contact` class in `app.py` |
| View | What user sees | HTML templates (Jinja2) |
| Controller | Logic connecting them | Flask route functions in `app.py` |

---

## Common Viva Questions — 30-Second Answers

**Q: What does your project do?**
"It's a business website for TechNova Solutions with six public pages. Visitors can submit contact enquiries that are saved to a database. An admin can log in securely to view and manage those enquiries."

**Q: Why Flask?**
"Flask is a micro-framework — it gives you routing and templating, nothing more. You have to build authentication, database access, and forms yourself. That makes it better for learning because you understand every piece."

**Q: Why SQLite?**
"SQLite stores the entire database in a single file. No server to install, no configuration. Python has it built in. It's perfect for a demo project. In production, I'd switch to PostgreSQL."

**Q: How does login work?**
"The admin submits the form, Flask compares the credentials, sets `session['logged_in'] = True` in an encrypted cookie, and redirects to the dashboard. Every protected route has a `@login_required` decorator that checks the session flag first."

**Q: What is an ORM?**
"It maps database tables to Python classes. I define `Contact` as a class with columns as attributes. SQLAlchemy converts `Contact.query.all()` to `SELECT * FROM contact`. I never write raw SQL — the ORM handles it and prevents SQL injection."

**Q: What is Jinja2?**
"Flask's templating engine. It processes HTML files before sending them to the browser. `{{ total_messages }}` gets replaced with the actual number from Python. `{% for msg in messages %}` loops over the database records."

**Q: What are the security weaknesses?**
"Password is hardcoded — should be hashed with `werkzeug.security`. No CSRF protection — Flask-WTF would fix that. SQLite isn't safe for concurrent users — PostgreSQL would replace it in production. No HTTPS — needs TLS in production."

**Q: What would you do differently?**
"Hash the password, add CSRF tokens on forms, add input validation on the server side, use PostgreSQL, add pagination on the inbox, and deploy to a cloud server with HTTPS."

---

## How to Run (for the Demo)

```cmd
cd "TechNova-Website"
pip install flask flask-sqlalchemy
python app.py
```

Open browser → `http://localhost:5000`

Admin panel: `http://localhost:5000/login`
- Username: `admin`
- Password: `password`

---

## Things to Point at During Demo

1. **Contact form** → submit it → show the new record appears in admin inbox
2. **Admin login** → wrong password shows error → right password shows dashboard
3. **Dashboard stats** → live count from database
4. **Messages inbox** → Jinja2 loop rendering real records
5. **Delete button** → record disappears immediately
6. **Chatbot** → click bubble → type "services" → instant FAQ response
7. **Logout** → trying to access `/admin` after logout redirects to `/login`

---

## Documentation Index

| File | Read for... |
|---|---|
| `project-documentation/1-project-overview.md` | What, why, who |
| `project-documentation/2-system-architecture.md` | Architecture diagrams |
| `project-documentation/3-technology-stack.md` | Deep dive on each technology |
| `project-documentation/4-database-documentation.md` | Schema, SQL, ER diagram |
| `project-documentation/5-source-code-explanation.md` | Every function in app.py explained |
| `project-documentation/6-application-workflow.md` | Flowcharts — what happens step by step |
| `project-documentation/7-api-documentation.md` | Every route documented |
| `project-documentation/8-development-process.md` | How to set up and run |
| `project-documentation/9-testing-documentation.md` | Test cases run |
| `project-documentation/10-viva-preparation.md` | More Q&A with detailed answers |
| `project-documentation/12-project-report.md` | Full academic report |

---

*Good luck with your submission and viva. You built this — you know it.*
