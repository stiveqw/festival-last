from flask import Blueprint, jsonify, request, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Festival
from . import db

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('festival_main.html')

@main.route('/apply')
def apply():
    return render_template('festival_apply.html')

@main.route('/about')
def about():
    return render_template('about.html')

@main.route('/api/festivals', methods=['GET'])
def get_festivals():
    festivals = Festival.query.all()
    return jsonify([f.to_dict() for f in festivals])

@main.route('/api/festivals', methods=['POST'])
@jwt_required()
def create_festival():
    data = request.json
    new_festival = Festival(
        name=data['name'],
        description=data['description'],
        date=datetime.fromisoformat(data['date']),
        location=data['location']
    )
    db.session.add(new_festival)
    db.session.commit()
    return jsonify(new_festival.to_dict()), 201

# 기존의 다른 라우트들도 여기에 추가

