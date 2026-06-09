import os
import functools
import smtplib
from email.message import EmailMessage
from flask import Flask, render_template, request, redirect, session, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///business.db'
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'technova-secret-2025')
app.config['MAIL_TO'] = os.environ.get('MAIL_TO', 'admin@technova.com')
app.config['SMTP_SERVER'] = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
app.config['SMTP_PORT'] = int(os.environ.get('SMTP_PORT', 587))
app.config['SMTP_USER'] = os.environ.get('SMTP_USER', '')
app.config['SMTP_PASS'] = os.environ.get('SMTP_PASS', '')

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'password'

db = SQLAlchemy(app)

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    subject = db.Column(db.String(200))
    message = db.Column(db.Text)

def login_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] == ADMIN_USERNAME and request.form['password'] == ADMIN_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('admin'))
        error = 'Invalid username or password. Please try again.'
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/about')
def about():
    return render_template("about.html")

@app.route('/projects')
def projects():
    return render_template("projects.html")

@app.route('/gallery')
def gallery():
    return render_template("gallery.html")

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        subject = request.form.get('subject')
        message = request.form.get('message')

        db.session.add(Contact(name=name, email=email, subject=subject, message=message))
        db.session.commit()

        try:
            msg = EmailMessage()
            msg['Subject'] = f"New enquiry from {name}"
            msg['From'] = app.config['SMTP_USER'] or 'noreply@technova.com'
            msg['To'] = app.config['MAIL_TO']
            msg.set_content(f"Name: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}")

            if app.config['SMTP_USER'] and app.config['SMTP_PASS']:
                with smtplib.SMTP(app.config['SMTP_SERVER'], app.config['SMTP_PORT']) as server:
                    server.starttls()
                    server.login(app.config['SMTP_USER'], app.config['SMTP_PASS'])
                    server.send_message(msg)
        except Exception:
            pass

        return render_template("contact.html", success=True)

    return render_template("contact.html")

@app.route('/services')
def services():
    return render_template("services.html")

@app.route('/admin')
@login_required
def admin():
    total_messages = Contact.query.count()
    return render_template("admin.html", total_messages=total_messages, total_projects=3, total_services=4)

@app.route('/messages')
@login_required
def messages():
    all_messages = Contact.query.order_by(Contact.id.desc()).all()
    return render_template("messages.html", messages=all_messages)

@app.route('/delete/<int:id>')
@login_required
def delete(id):
    msg = Contact.query.get(id)
    if msg:
        db.session.delete(msg)
        db.session.commit()
    return redirect(url_for('messages'))

with app.app_context():
    db.create_all()
    if Contact.query.count() == 0:
        db.session.add_all([
            Contact(name="Ananya Rao", email="ananya@meridian.health", subject="Analytics Dashboard", message="We'd love to discuss building an analytics dashboard for our operations team. When are you free for a discovery call?"),
            Contact(name="Rohan Mehta", email="rohan@brightschools.in", subject="School ERP Platform", message="Interested in your School ERP platform. Could you share pricing and a demo for a 2,000-student campus?"),
            Contact(name="Sara Lewis", email="sara@novacart.com", subject="AI Recommendation Engine", message="Our e-commerce store needs an AI-powered product recommendation engine. Do you take on integration-only projects?"),
            Contact(name="Kiran Patel", email="kiran@startupfuel.io", subject="Mobile App Development", message="Looking to build a cross-platform mobile app for our fintech startup. What is your typical timeline and cost range?"),
            Contact(name="Priya Nair", email="priya@greentech.in", subject="Website Redesign", message="We need a complete redesign of our corporate website with modern UI and better SEO. Can we schedule a consultation?"),
        ])
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)
