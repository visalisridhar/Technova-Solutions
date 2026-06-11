import os
import smtplib
from email.message import EmailMessage
from flask import Flask, render_template, request, redirect
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///business.db'
app.config['MAIL_TO'] = os.environ.get('MAIL_TO', 'admin@technova.com')
app.config['SMTP_SERVER'] = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
app.config['SMTP_PORT'] = int(os.environ.get('SMTP_PORT', 587))
app.config['SMTP_USER'] = os.environ.get('SMTP_USER', '')
app.config['SMTP_PASS'] = os.environ.get('SMTP_PASS', '')

db = SQLAlchemy(app)
class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    message = db.Column(db.Text)

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
        message = request.form.get('message')

        new_contact = Contact(
            name=name,
            email=email,
            message=message
        )

        db.session.add(new_contact)
        db.session.commit()

        try:
            msg = EmailMessage()
            msg['Subject'] = f"New Contact Form Message from {name}"
            msg['From'] = app.config['SMTP_USER'] or 'noreply@technova.com'
            msg['To'] = app.config['MAIL_TO']
            body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
            msg.set_content(body)

            if app.config['SMTP_USER'] and app.config['SMTP_PASS']:
                with smtplib.SMTP(app.config['SMTP_SERVER'], app.config['SMTP_PORT']) as server:
                    server.starttls()
                    server.login(app.config['SMTP_USER'], app.config['SMTP_PASS'])
                    server.send_message(msg)
        except Exception:
            pass

        return render_template("contact.html", success="Message Submitted Successfully!")

    return render_template("contact.html")
@app.route('/services')
def services():
    return render_template("services.html")     
@app.route('/messages')
def messages():

    all_messages = Contact.query.all()

    return render_template(
        "messages.html",
        messages=all_messages
    )



@app.route('/delete/<int:id>')
def delete(id):

    message = Contact.query.get(id)

    db.session.delete(message)
    db.session.commit()

    return redirect('/messages')

@app.route('/admin')
def admin():

    total_messages = Contact.query.count()

    total_projects = 3
    total_services = 4

    return render_template(
        "admin.html",
        total_messages=total_messages,
        total_projects=total_projects,
        total_services=total_services
    )
@app.route('/login')
def login():
    return render_template("login.html")
app.run(debug=True)