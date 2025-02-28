from flask import Flask, request, jsonify # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from flask_marshmallow import Marshmallow # type: ignore
import os
from flask_cors import CORS # type: ignore

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///students.db'

db = SQLAlchemy(app)
ma = Marshmallow(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    student_class = db.Column(db.String(50), nullable=False)

class Marks(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exam_name = db.Column(db.String(100), nullable=False)
    subjects_marks = db.Column(db.JSON, nullable=False)
    total_marks = db.Column(db.JSON, nullable=False)
    date = db.Column(db.String(100), nullable=False)
    grade = db.Column(db.String(10), nullable=False)
    percentage = db.Column(db.Float, nullable=False)

# Serializers
class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User

class MarksSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Marks

user_schema = UserSchema()
users_schema = UserSchema(many=True)
marks_schema = MarksSchema()
marks_list_schema = MarksSchema(many=True)

# Routes
@app.route('/users', methods=['POST'])
def add_user():
    data = request.json
    
    new_user = User(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        student_class=data['student_class']
    )
    
    db.session.add(new_user)
    db.session.commit()
    return user_schema.jsonify(new_user)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'message': 'Health check passed'})

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return users_schema.jsonify(users)

@app.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.json
    
    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    user.phone = data.get('phone', user.phone)
    user.student_class = data.get('student_class', user.student_class)
    
    db.session.commit()
    return user_schema.jsonify(user)

@app.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@app.route('/all_marks', methods=['GET'])
def get_all_marks():
    marks = Marks.query.all()
    return marks_list_schema.jsonify(marks)

@app.route('/marks', methods=['POST'])
def add_marks():
    data = request.json
    
    for subject, marks in data['subjects_marks'].items():
        if marks > data['total_marks'][subject]:
            return jsonify({'error': f'Marks for {subject} cannot be more than total marks'}), 400
    
    obtained_marks = sum(data['subjects_marks'].values())
    total_marks = sum(data['total_marks'].values())
    percentage = (obtained_marks / total_marks) * 100

    if percentage >= 90:
        grade = 'A'
    elif percentage >= 80:
        grade = 'B'
    elif percentage >= 70:
        grade = 'C'
    elif percentage >= 60:
        grade = 'D'
    else:
        grade = 'F'

    new_marks = Marks(
        user_id=data['user_id'],
        exam_name=data['exam_name'],
        subjects_marks=data['subjects_marks'],
        total_marks=data['total_marks'],
        date=data['date'],
        grade=grade,  
        percentage=percentage
    )
    
    db.session.add(new_marks)
    db.session.commit()
    
    return marks_schema.jsonify(new_marks)

@app.route('/marks/<int:id>', methods=['PUT'])
def update_marks(id):
    marks = Marks.query.get_or_404(id)
    data = request.json

    marks.exam_name = data.get('exam_name', marks.exam_name)
    marks.date = data.get('date', marks.date)
    
    if 'subjects_marks' in data and 'total_marks' in data:
        for subject, score in data['subjects_marks'].items():
            if score > data['total_marks'][subject]:
                return jsonify({'error': f'Marks for {subject} cannot be more than total marks'}), 400
        
        marks.subjects_marks = data['subjects_marks']
        marks.total_marks = data['total_marks']
        
        obtained_marks = sum(data['subjects_marks'].values())
        total_marks = sum(data['total_marks'].values())
        marks.percentage = (obtained_marks / total_marks) * 100

        if marks.percentage >= 90:
            marks.grade = 'A'
        elif marks.percentage >= 80:
            marks.grade = 'B'
        elif marks.percentage >= 70:
            marks.grade = 'C'
        elif marks.percentage >= 60:
            marks.grade = 'D'
        else:
            marks.grade = 'F'
    
    db.session.commit()
    return marks_schema.jsonify(marks)


@app.route('/marks/<int:user_id>', methods=['GET'])
def get_marks(user_id):
    marks = Marks.query.filter_by(user_id=user_id).all()
    return marks_list_schema.jsonify(marks)

@app.route('/marks/<int:id>', methods=['DELETE'])
def delete_marks(id):
    marks = Marks.query.get_or_404(id)
    db.session.delete(marks)
    db.session.commit()
    return jsonify({'message': 'Marks deleted'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()