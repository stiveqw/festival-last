from flask import Flask, render_template, redirect, make_response, url_for, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, verify_jwt_in_request, unset_jwt_cookies
from config import Config
from models import Festival, db
from math import ceil
import os

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
jwt = JWTManager(app)

ITEMS_PER_PAGE = 3

def get_festival_images():
    image_dir = os.path.join(app.static_folder, 'images')
    return set(f for f in os.listdir(image_dir) if f.startswith('festival_') and f.endswith('.jpg'))

@app.context_processor
def utility_processor():
    return dict(get_festival_images=get_festival_images)

@app.route('/')
def home():
    page = request.args.get('page', 1, type=int)
    festivals = Festival.query.paginate(page=page, per_page=ITEMS_PER_PAGE, error_out=False)
    total_pages = ceil(festivals.total / ITEMS_PER_PAGE)
    return render_template('festival_main.html', festivals=festivals.items, page=page, total_pages=total_pages)

@app.route('/apply/<int:festival_id>')
def apply(festival_id):
    festival = Festival.query.get_or_404(festival_id)
    return render_template('festival_apply.html', festival=festival)

@app.route('/api/festival/<int:festival_id>')
@jwt_required()
def get_festival(festival_id):
    festival = Festival.query.get_or_404(festival_id)
    return jsonify(festival.to_dict())

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    response = make_response(redirect('http://localhost:5006/login'))
    unset_jwt_cookies(response)
    return response

@app.route('/redirect_to_main')
def redirect_to_main():
    return redirect('http://localhost:5003')

@app.route('/redirect_to_news')
def redirect_to_news():
    return redirect('http://localhost:5004/news')

@app.route('/redirect_to_course')
def redirect_to_course():
    return redirect('http://localhost:5001/course_registration')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)

