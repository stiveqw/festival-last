from flask import Flask, render_template, request, jsonify
from config import Config
import random
import json
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 파일 경로 설정
    RESERVATIONS_FILE = 'reservations.json'
    SEAT_COUNTS_FILE = 'seat_counts.json'

    # 예약 정보 로드
    def load_reservations():
        if os.path.exists(RESERVATIONS_FILE):
            with open(RESERVATIONS_FILE, 'r') as f:
                return json.load(f)
        return {}

    # 예약 정보 저장
    def save_reservations(reservations):
        with open(RESERVATIONS_FILE, 'w') as f:
            json.dump(reservations, f)

    # 좌석 수 로드
    def load_seat_counts():
        if os.path.exists(SEAT_COUNTS_FILE):
            with open(SEAT_COUNTS_FILE, 'r') as f:
                return json.load(f)
        return {}

    # 좌석 수 저장
    def save_seat_counts(seat_counts):
        with open(SEAT_COUNTS_FILE, 'w') as f:
            json.dump(seat_counts, f)

    # 초기 데이터 로드
    seat_reservations = load_reservations()
    seat_counts = load_seat_counts()

    # 카누 축제 추가 및 모든 좌석 예약
    canoe_festival_id = '10'
    if canoe_festival_id not in seat_counts:
        seat_counts[canoe_festival_id] = 150  # 카누 축제의 좌석 수를 150개로 설정
        save_seat_counts(seat_counts)

    if canoe_festival_id not in seat_reservations:
        seat_reservations[canoe_festival_id] = list(range(1, seat_counts[canoe_festival_id] + 1))
        save_reservations(seat_reservations)

    # id가 2와 6인 축제의 좌석을 1개만 남기고 예약
    for festival_id in ['2', '6']:
        if festival_id not in seat_counts:
            seat_counts[festival_id] = 100  # 예시로 100개의 좌석 설정
            save_seat_counts(seat_counts)

        if festival_id not in seat_reservations:
            seat_reservations[festival_id] = list(range(1, seat_counts[festival_id]))  # 마지막 좌석 번호를 제외하고 모두 예약
            save_reservations(seat_reservations)

    @app.route('/')
    def home():
        return render_template('festival_main.html')

    @app.route('/apply/<int:festival_id>')
    def apply(festival_id):
        title = request.args.get('title', '샘플 축제')
        description = request.args.get('description', '이것은 샘플 축제 설명입니다.')
        image = request.args.get('image', 'sample-festival.jpg')

        festival = {
            'id': festival_id,
            'title': title,
            'description': description,
            'image': image
        }
        return render_template('festival_apply.html', festival=festival)

    @app.route('/api/seat-count/<int:festival_id>')
    def get_seat_count(festival_id):
        festival_id = str(festival_id)  # JSON keys must be strings
        if festival_id not in seat_counts:
            seat_counts[festival_id] = random.randint(100, 300)
            save_seat_counts(seat_counts)
        return jsonify({"seat_count": seat_counts[festival_id]})

    @app.route('/api/reserved-seats/<int:festival_id>')
    def get_reserved_seats(festival_id):
        festival_id = str(festival_id)  # JSON keys must be strings
        reserved_seats = seat_reservations.get(festival_id, [])
        return jsonify({"reserved_seats": reserved_seats})

    @app.route('/api/apply', methods=['POST'])
    def submit_application():
        data = request.json
        festival_id = str(data['festival_id'])  # JSON keys must be strings
        seat_number = data['seat_number']

        if festival_id not in seat_reservations:
            seat_reservations[festival_id] = []

        if seat_number not in seat_reservations[festival_id]:
            seat_reservations[festival_id].append(seat_number)
            save_reservations(seat_reservations)
            return jsonify({"success": True, "message": "Application submitted successfully!"})
        else:
            return jsonify({"success": False, "message": "Seat already reserved."})

    @app.route('/api/festival-status')
    def get_festival_status():
        status = {}
        for festival_id in seat_counts.keys():
            total_seats = seat_counts.get(festival_id, 0)
            reserved_seats = len(seat_reservations.get(festival_id, []))
            status[festival_id] = {
                'is_full': reserved_seats >= total_seats,
                'available_seats': total_seats - reserved_seats
            }
        return jsonify(status)

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('error.html', 
            error_code="404 Not Found", 
            error_message="요청하신 페이지를 찾을 수 없습니다."
        ), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template('error.html', 
            error_code="500 Internal Server Error", 
            error_message="서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        ), 500

    return app

if __name__ == '__main__':
    app = create_app()
    # debug 모드를 False로 설정하여 실제 에러 페이지가 표시되도록 함
    app.run(debug=False, host='0.0.0.0', port=5000)

