document.addEventListener('DOMContentLoaded', function() {
    const seatGrid = document.getElementById('seatGrid');
    const applyButton = document.getElementById('applyButton');
    const seatInfo = document.getElementById('seatInfo');
    let selectedSeat = null;
    let totalSeats = 0;
    let occupiedSeats = 0;

    function updateSeatInfo() {
        seatInfo.textContent = `(예약됨: ${occupiedSeats} / 전체: ${totalSeats})`;
    }

    function createSeats(seatCount) {
        totalSeats = seatCount;
        seatGrid.innerHTML = '';
        for (let i = 1; i <= seatCount; i++) {
            const seat = document.createElement('button');
            seat.classList.add('seat');
            seat.dataset.seatNumber = i;
            seat.textContent = i;
            seat.addEventListener('click', toggleSeat);
            seatGrid.appendChild(seat);
        }
        fetchReservedSeats();
    }

    function fetchReservedSeats() {
        // URL에서 festival_id 가져오기
        const pathParts = window.location.pathname.split('/');
        const festivalId = pathParts[pathParts.length - 1]; // URL 경로에서 festival_id 추출

        fetch(`/api/reserved-seats/${festivalId}`)
            .then(response => response.json())
            .then(data => {
                occupiedSeats = data.reserved_seats.length;
                data.reserved_seats.forEach(seatNumber => {
                    const seat = document.querySelector(`.seat[data-seat-number="${seatNumber}"]`);
                    if (seat) {
                        seat.classList.add('occupied');
                        seat.disabled = true;
                    }
                });
                updateSeatInfo();
            })
            .catch(error => {
                console.error('Error fetching reserved seats:', error);
            });
    }

    function toggleSeat(event) {
        const seat = event.target;
        if (seat.classList.contains('occupied')) return;

        if (selectedSeat) {
            selectedSeat.classList.remove('selected');
        }

        if (selectedSeat !== seat) {
            seat.classList.add('selected');
            selectedSeat = seat;
            applyButton.disabled = false;
        } else {
            selectedSeat = null;
            applyButton.disabled = true;
        }
    }

    applyButton.addEventListener('click', function() {
        if (selectedSeat) {
            const pathParts = window.location.pathname.split('/');
            const festivalId = pathParts[pathParts.length - 1]; // URL 경로에서 festival_id 추출

            fetch('/api/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    festival_id: festivalId,
                    seat_number: parseInt(selectedSeat.dataset.seatNumber)
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('신청이 완료되었습니다!');
                    selectedSeat.classList.add('occupied');
                    selectedSeat.disabled = true;
                    selectedSeat.classList.remove('selected');
                    selectedSeat = null;
                    applyButton.disabled = true;
                    occupiedSeats++;
                    updateSeatInfo();
                    // 홈으로 이동하는 a 태그를 생성하고 클릭
                    const homeLink = document.createElement('a');
                    homeLink.href = '/';
                    homeLink.style.display = 'none';
                    document.body.appendChild(homeLink);
                    homeLink.click();
                    document.body.removeChild(homeLink);
                } else {
                    alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
                }
            })
            .catch(error => {
                console.error('Error submitting application:', error);
                alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
            });
        }
    });

    // 초기 좌석 수 가져오기
    const pathParts = window.location.pathname.split('/');
    const festivalId = pathParts[pathParts.length - 1]; // URL 경로에서 festival_id 추출

    fetch(`/api/seat-count/${festivalId}`)
        .then(response => response.json())
        .then(data => {
            createSeats(data.seat_count);
        })
        .catch(error => {
            console.error('Error fetching seat count:', error);
        });
});

