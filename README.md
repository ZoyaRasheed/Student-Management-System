# Student Management System

The **Student Management System** is a web-based platform that allows teachers to add student marks and students to view their marks. It consists of a **backend (Flask API with SQLite database)** and a **frontend (HTML, CSS, and JavaScript)**.

## Features
- Teachers can add student details and marks.
- Students can view their marks.
- RESTful API endpoints for managing users and marks.
- Web-based frontend to interact with the system.


## Backend - Flask API

### Technologies Used
- Python (Flask Framework)
- Flask-SQLAlchemy (Database ORM)
- SQLite (Database)
- Flask-CORS (Cross-Origin Requests)
- Flask-Marshmallow (Serialization)

### Installation and Setup

#### Prerequisites
- Python 3.x installed
- Pip installed

#### Steps to Start Backend Server
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Create a virtual environment:**
   ```bash
   python3 -m venv env
   # or
   python -m venv env
   ```
3. **Activate the virtual environment:**
   ```bash
   source env/bin/activate  # Mac/Linux
   # or (for Windows)
   env\Scripts\activate
   ```
4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
5. **Start the development server:**
   ```bash
   python app.py
   ```

### API Endpoints

#### User Management
- **Add a User:** `POST /users`
- **Get All Users:** `GET /users`
- **Update a User:** `PUT /users/<id>`
- **Delete a User:** `DELETE /users/<id>`

#### Marks Management
- **Add Marks:** `POST /marks`
- **Get All Marks:** `GET /all_marks`
- **Get Marks by User:** `GET /marks/<user_id>`
- **Update Marks:** `PUT /marks/<id>`
- **Delete Marks:** `DELETE /marks/<id>`

---

## Frontend - Web Interface

### Technologies Used
- HTML
- CSS
- JavaScript

### Structure
The frontend consists of the following files:
- `index.html` - The main UI for students and teachers.
- `styles.css` - Styles for the interface.
- `scripts.js` - Handles UI interactions and API calls.

### Running the Frontend
Simply open the `index.html` file in a web browser.

