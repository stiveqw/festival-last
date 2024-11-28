document.addEventListener('DOMContentLoaded', function() {
    const festivalData = [
        { 
            id: 1,
            title: '단풍빛 가을 축제', 
            description: '화려한 단풍과 함께하는 가을의 정취를 만끽하세요. 전통 음식, 야외 콘서트, 단풍 길 산책 등 다양한 행사가 준비되어 있습니다.', 
            image: 'autumn-festival.jfif' 
        },
        { 
            id: 2,
            title: '세계 문화 교류 축제', 
            description: '다양한 나라의 문화를 한 자리에서 경험해보세요. 전통 의상, 음식, 공연을 통해 세계 여행을 떠나보세요.', 
            image: 'culture-festival.jfif' 
        },
        { 
            id: 3,
            title: '국제 독립영화 축제', 
            description: '세계 각국의 독창적인 독립영화를 만나보세요. 감독과의 대화, 영화 제작 워크샵 등 특별한 경험을 제공합니다.', 
            image: 'film-festival.jfif' 
        },
        { 
            id: 4,
            title: '월드컵 거리 응원 축제', 
            description: '축구의 열정을 함께 나눠요! 대형 스크린으로 경기를 관람하고, 다양한 축구 관련 이벤트에 참여해보세요.', 
            image: 'festival-schedule.jfif' 
        },
        { 
            id: 5,
            title: '여름밤 재즈 페스티벌', 
            description: '시원한 여름밤, 감미로운 재즈의 선율에 취해보세요. 국내외 유명 재즈 뮤지션들의 라이브 공연을 즐기실 수 있습니다.', 
            image: 'music-festival.jfif' 
        },
        { 
            id: 6,
            title: '올림픽데이 런 페스티벌', 
            description: '올림픽 정신을 기념하는 러닝 축제입니다. 5km, 10km 코스와 함께 다양한 스포츠 체험 부스가 운영됩니다.', 
            image: 'sports-festival.jfif' 
        },
        { 
            id: 7,
            title: '벚꽃 한마당 축제', 
            description: '아름다운 벚꽃과 함께 봄의 시작을 알리는 축제입니다. 벚꽃 길 산책, 봄 맞이 음악회, 꽃 시장 등이 열립니다.', 
            image: 'spring-festival.jfif' 
        },
        { 
            id: 8,
            title: '한여름 밤의 꿈 축제', 
            description: '무더운 여름밤을 시원하게 만들어줄 야간 축제입니다. 야외 영화 상영, 불꽃놀이, 한밤의 마켓 등이 진행됩니다.', 
            image: 'summer-festival.jfif' 
        },
        { 
            id: 9,
            title: '겨울 왕국 눈꽃 축제', 
            description: '새하얀 눈으로 뒤덮인 겨울 왕국으로 여러분을 초대합니다. 눈조각 전시, 썰매 타기, 스키, 눈싸움 대회 등 겨울 속으로 풍덩 빠져보세요.', 
            image: 'winter-festival.jfif' 
        },
        {
            id: 10,
            title: '여름 카누 축제',
            description: '시원한 강에서 카누를 즐기며 여름의 열기를 식히세요. 초보자부터 전문가까지 모두가 즐길 수 있는 다양한 코스가 준비되어 있습니다.',
            image: 'canoe-festival.jfif'
        },
        {
            id: 11,
            title: '테스트 에러 축제',
            description: '이 축제는 에러 페이지를 테스트하기 위한 축제입니다.',
            image: 'festival-back.jfif'
        },
        {
            id: 12,
            title: '404 테스트 축제',
            description: '이 축제는 404 에러 페이지를 테스트하기 위한 축제입니다.',
            image: 'festival-back.jfif'
        }
    ];

    const itemsPerPage = 3;
    let currentPage = 1;

    function displayFestivals(page) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const festivalsToShow = festivalData.slice(startIndex, endIndex);

        const gridContainer = document.getElementById('festival-list');
        if (!gridContainer) return;

        // 축제 상태 정보 가져오기
        fetch('/api/festival-status')
            .then(response => response.json())
            .then(festivalStatus => {
                gridContainer.innerHTML = '';

                festivalsToShow.forEach(festival => {
                    const status = festivalStatus[festival.id];
                    const isFull = status?.is_full || false;
                    const availableSeats = status?.available_seats || 0;

                    const festivalElement = document.createElement('div');
                    festivalElement.className = 'festival-item';
                    festivalElement.innerHTML = `
                        <img src="/static/images/${festival.image}" alt="${festival.title}">
                        <h3>${festival.title}</h3>
                        <p>${festival.description}</p>
                        <p class="seat-count ${isFull ? 'sold-out' : ''}">
                            ${isFull ? '매진되었습니다' : `남은 좌석: ${availableSeats}석`}
                        </p>
                        <button onclick="applyForFestival(${festival.id})" 
                                class="${isFull ? 'full' : ''}"
                                ${isFull ? 'disabled' : ''}>
                            ${isFull ? '매진' : '신청하기'}
                        </button>
                    `;
                    gridContainer.appendChild(festivalElement);
                });
            })
            .catch(error => {
                console.error('Error fetching festival status:', error);
            });

        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(festivalData.length / itemsPerPage);
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '이전';
            prevButton.onclick = () => changePage(currentPage - 1);
            paginationContainer.appendChild(prevButton);
        }

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = i === currentPage ? 'active' : '';
            pageButton.onclick = () => changePage(i);
            paginationContainer.appendChild(pageButton);
        }

        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '다음';
            nextButton.onclick = () => changePage(currentPage + 1);
            paginationContainer.appendChild(nextButton);
        }
    }

    function changePage(page) {
        currentPage = page;
        displayFestivals(currentPage);
    }

    window.applyForFestival = function(festivalId) {
        const festival = festivalData.find(f => f.id === festivalId);
        if (festival) {
            if (festivalId === 11) {
                // 테스트 에러 축제의 경우 존재하지 않는 API를 호출하여 500 에러 발생
                fetch('/api/non-existent-endpoint')
                    .then(response => response.json())
                    .catch(error => {
                        window.location.href = '/trigger-error';
                    });
            } else if (festivalId === 12) {
                // 404 테스트 축제의 경우 존재하지 않는 경로로 이동
                window.location.href = '/non-existent-page';
            } else {
                const params = new URLSearchParams({
                    title: festival.title,
                    description: festival.description,
                    image: festival.image
                });
                window.location.href = `/apply/${festivalId}?${params.toString()}`;
            }
        }
    }

    displayFestivals(currentPage);

    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });
});

