let games = [];

let leaderboard = [];

let isAdmin = false;
function initializeLeaderboard() {
    leaderboard = [];  // leaderboard 초기화
    for (let i = 1; i <= 7; i++) {
        leaderboard.push({ team: i, score: 0 });
    }
}
function updateDday() {
    const eventDate = new Date('2024-10-23');  // 체육대회 날짜를 2024년 10월 23일로 수정
    const today = new Date();
    const timeDiff = eventDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let ddayText;
    if (dayDiff > 0) {
        ddayText = `D-${dayDiff}`;
    } else if (dayDiff === 0) {
        ddayText = "D-Day";
    } else {
        ddayText = `D+${Math.abs(dayDiff)}`;
    }

    document.getElementById('dday').textContent = ddayText;
}

// 페이지 로드 시 실행되는 코드
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initializeLeaderboard();
    renderLeaderboard();
    renderGames();
    updateDday();
});

function updateLeaderboard() {
    leaderboard.forEach(entry => entry.score = 0);
    games.forEach(game => {
        if (game.type === 'custom') {
            Object.entries(game.scores).forEach(([team, score]) => {
                const teamIndex = leaderboard.findIndex(entry => entry.team === parseInt(team));
                if (teamIndex !== -1) {
                    leaderboard[teamIndex].score += score;
                }
            });
        } else {
            if (game.first) leaderboard.find(entry => entry.team === game.first).score += 100;
            if (game.second) leaderboard.find(entry => entry.team === game.second).score += 80;
            if (game.third) leaderboard.find(entry => entry.team === game.third).score += 60;
            
            // 1, 2, 3등이 모두 입력된 경우에만 나머지 팀에게 40점 부여
            if (game.first && game.second && game.third) {
                leaderboard.forEach(entry => {
                    if (entry.team !== game.first && entry.team !== game.second && entry.team !== game.third) {
                        entry.score += 40;
                    }
                });
            }
        }
    });
    leaderboard.sort((a, b) => b.score - a.score);
    let currentRank = 1;
    let currentScore = -1;
    leaderboard.forEach((entry, index) => {
        if (entry.score !== currentScore) {
            currentRank = index + 1;
            currentScore = entry.score;
        }
        entry.rank = currentRank;
    });
    renderLeaderboard();
}
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    leaderboard.forEach((entry) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = entry.rank;
        row.insertCell(1).textContent = entry.team + '반';
        row.insertCell(2).textContent = entry.score;
        row.classList.add('fade-in');
    });

    const podiumOrder = ['second-place', 'first-place', 'third-place'];
    const podiumItems = podiumOrder.map(id => document.getElementById(id));
    
    for (let i = 0; i < 3 && i < leaderboard.length; i++) {
        const entry = leaderboard[i];
        const podiumItem = podiumItems[i];
        if (podiumItem) {
            const avatar = podiumItem.querySelector('.avatar');
            const podiumClass = podiumItem.querySelector('.podium-class');
            const podiumPoints = podiumItem.querySelector('.podium-points');

            if (avatar) avatar.textContent = entry.rank;
            if (podiumClass) podiumClass.textContent = entry.team + '반';
            if (podiumPoints) podiumPoints.textContent = entry.score + ' Point';

            // 동점 처리
            if (i > 0 && entry.score === leaderboard[i-1].score) {
                podiumItem.style.height = podiumItems[i-1].style.height;
                avatar.textContent = leaderboard[i-1].rank;
            } else {
                podiumItem.style.height = `${200 - (i * 30)}px`;
            }

            // 애니메이션 추가
            podiumItem.style.opacity = '0';
            podiumItem.style.transform = 'translateY(20px)';
            setTimeout(() => {
                podiumItem.style.transition = 'opacity 0.5s, transform 0.5s';
                podiumItem.style.opacity = '1';
                podiumItem.style.transform = 'translateY(0)';
            }, i * 200);
        }
    }
}
function renderGames() {
    const gameList = document.getElementById('gameList');
    gameList.innerHTML = '';
    games.forEach((game, index) => {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-item';
        if (game.type === 'custom') {
            const scores = Object.entries(game.scores);
            const allZero = scores.every(([_, score]) => score === 0);
            gameDiv.innerHTML = `
                <h3>${game.name}</h3>
                ${allZero ? '<p>미정</p>' : scores.map(([team, score]) => `
                    <p>${team}반: ${score}점</p>
                `).join('')}
            `;
        } else {
            gameDiv.innerHTML = `
                <h3>${game.name}</h3>
                <div class="game-podium">
                    <div class="game-podium-item">
                        <div class="game-avatar">2</div>
                        <p>${game.second ? game.second + '반' : '미정'}</p>
                        <div class="game-podium-base">2등</div>
                    </div>
                    <div class="game-podium-item">
                        <div class="game-avatar">1</div>
                        <p>${game.first ? game.first + '반' : '미정'}</p>
                        <div class="game-podium-base">1등</div>
                    </div>
                    <div class="game-podium-item">
                        <div class="game-avatar">3</div>
                        <p>${game.third ? game.third + '반' : '미정'}</p>
                        <div class="game-podium-base">3등</div>
                    </div>
                </div>
            `;
        }
        gameList.appendChild(gameDiv);
        setTimeout(() => {
            gameDiv.style.opacity = '0';
            gameDiv.style.transform = 'scale(0.9) translateY(30px)';
            gameDiv.offsetHeight; // Trigger reflow
            gameDiv.style.transition = 'all 0.5s ease-out';
            gameDiv.style.opacity = '1';
            gameDiv.style.transform = 'scale(1) translateY(0)';
        }, index * 100);
    });
}
function renderAdminGames() {
    const gameList = document.getElementById('gameList');
    gameList.innerHTML = '';
    games.forEach((game, index) => {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'admin-game-item';
        if (game.type === 'custom') {
            gameDiv.innerHTML = `
                <h3>${game.name}</h3>
                <input type="text" id="gameName${index}" value="${game.name}" placeholder="사유">
                ${[1,2,3,4,5,6,7].map(i => `
                    <div>
                        <label for="score${index}_${i}">${i}반 점수:</label>
                        <input type="number" id="score${index}_${i}" value="${game.scores[i] || 0}" placeholder="점수">
                    </div>
                `).join('')}
                <button onclick="updateCustomGame(${index})">수정</button>
                <button onclick="deleteGame(${index})">삭제</button>
            `;
        } else {
            gameDiv.innerHTML = `
                <h3>${game.name}</h3>
                <input type="text" id="gameName${index}" value="${game.name}" placeholder="경기 이름">
                <select id="first${index}">
                    ${generateClassOptions(game.first)}
                </select>
                <select id="second${index}">
                    ${generateClassOptions(game.second)}
                </select>
                <select id="third${index}">
                    ${generateClassOptions(game.third)}
                </select>
                <button onclick="updateGame(${index})">수정</button>
                <button onclick="deleteGame(${index})">삭제</button>
            `;
        }
        gameList.appendChild(gameDiv);
    });
    const addGameDiv = document.createElement('div');
    addGameDiv.className = 'admin-game-item';
    addGameDiv.innerHTML = `
        <h3>새 경기 추가</h3>
        <input type="text" id="newGameName" placeholder="경기 이름">
        <button onclick="addGame()">추가</button>
    `;
    gameList.appendChild(addGameDiv);

    // 임의 점수 추가 섹션 수정
    const addScoreDiv = document.createElement('div');
    addScoreDiv.className = 'admin-game-item';
    addScoreDiv.innerHTML = `
        <h3>임의 점수 추가</h3>
        <input type="text" id="scoreReason" placeholder="사유">
        ${[1,2,3,4,5,6,7].map(i => `
            <div>
                <label for="score${i}">${i}반 점수:</label>
                <input type="number" id="score${i}" placeholder="점수">
            </div>
        `).join('')}
        <button onclick="addCustomScore()">점수 추가</button>
    `;
    gameList.appendChild(addScoreDiv);

    const logoutButton = document.createElement('button');
    logoutButton.textContent = '관리자 모드 종료';
    logoutButton.onclick = logout;
    gameList.appendChild(logoutButton);
}
function generateClassOptions(selectedClass) {
    let options = '<option value="">선택</option>';
    for (let i = 1; i <= 7; i++) {
        options += `<option value="${i}" ${i === selectedClass ? 'selected' : ''}>${i}반</option>`;
    }
    return options;
}
function saveGame(index) {
    games[index].first = parseInt(document.getElementById(`first-${index}`).value) || null;
    games[index].second = parseInt(document.getElementById(`second-${index}`).value) || null;
    games[index].third = parseInt(document.getElementById(`third-${index}`).value) || null;
    games[index].scheduledTime = document.getElementById(`time-${index}`).value;
    saveData();
}
function deleteGame(index) {
    if (confirm('정말로 이 경기를 삭제하시겠습니까?')) {
        games.splice(index, 1);
        saveToLocalStorage();
        saveToServer()
            .then(() => {
                showMessage('경기가 삭제되었습니다.');
                renderAdminGames();
                renderGames();
            })
            .catch(error => {
                showMessage('삭제 중 오류가 발생했습니다: ' + error.message);
            });
    }
}
function addNewGame() {
    const gameName = prompt('새 경기 이름을 입력하세요:');
    if (gameName) {
        games.push({ name: gameName, first: null, second: null, third: null });
        saveData();
    }
}
function addCustomGame() {
    const gameName = prompt('새 커스텀 경기 이름을 입력하세요:');
    if (gameName) {
        const customScores = {};
        for (let i = 1; i <= 7; i++) {
            const score = prompt(`${i}반의 점수를 입력하세요 (입력하지 않으면 0점):`) || '0';
            customScores[i] = parseInt(score);
        }
        games.push({ name: gameName, type: 'custom', scores: customScores });
        saveData();
    }
}
function saveCustomGame(index) {
    const scores = {};
    for (let i = 1; i <= 7; i++) {
        scores[i] = parseInt(document.getElementById(`custom-${index}-${i}`).value) || 0;
    }
    games[index].scores = scores;
    games[index].scheduledTime = document.getElementById(`time-${index}`).value;
    saveData();
}
function saveData() {
    localStorage.setItem('games', JSON.stringify(games));
    saveToServer()
        .then(() => {
            updateLeaderboard();
            if (isAdmin) {
                renderAdminGames();
            } else {
                renderGames();
            }
        })
        .catch(error => {
            showMessage('서버 저장 중 오류가 발생했습니다: ' + error.message);
        });
}
function loadData() {
    return fetch(`${BACKEND_URL}/api/games`)
        .then(response => response.json())
        .then(data => {
            games = data;
            updateLeaderboard();
            renderGames();
            if (isAdmin) {
                renderAdminGames();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('editButton');
    const showLeaderboardButton = document.getElementById('showLeaderboard');
    const showGamesButton = document.getElementById('showGames');

    editButton.addEventListener('click', toggleEditMode);
    showLeaderboardButton.addEventListener('click', showLeaderboard);
    showGamesButton.addEventListener('click', showGames);

    // 초기 로드
    initializeLeaderboard();
    loadData();
    
    // 디데이 업데이트
    updateDday();
});

function toggleEditMode() {
    if (!isAdmin) {
        const password = prompt("비밀번호를 입력하세요:");
        if (password === 'admin123') {
            isAdmin = true;
            renderAdminGames();
            showMessage('관리자 모드가 활성화되었습니다.');
        } else {
            alert('비밀번호가 틀렸습니다.');
            return;
        }
    }
    
    // 이미 관리자 모드인 경우, 게임 목록을 다시 렌더링합니다.
    if (isAdmin) {
        renderAdminGames();
    }
}

function showLeaderboard() {
    document.getElementById('leaderboard').style.display = 'block';
    document.getElementById('gamesList').style.display = 'none';
    document.getElementById('showLeaderboard').classList.add('active');
    document.getElementById('showGames').classList.remove('active');
}

function showGames() {
    document.getElementById('leaderboard').style.display = 'none';
    document.getElementById('gamesList').style.display = 'block';
    document.getElementById('showLeaderboard').classList.remove('active');
    document.getElementById('showGames').classList.add('active');
    if (isAdmin) {
        renderAdminGames();
    } else {
        renderGames();
    }
}

// 기존의 다른 함수들 (updateLeaderboard, renderLeaderboard, renderGames 등)은 그대로 유지

function updateGame(index) {
    const gameName = document.getElementById(`gameName${index}`).value;
    const first = parseInt(document.getElementById(`first${index}`).value);
    const second = parseInt(document.getElementById(`second${index}`).value);
    const third = parseInt(document.getElementById(`third${index}`).value);

    games[index] = { name: gameName, first, second, third };

    saveToServer()
        .then(() => {
            showMessage('변경사항이 저장되었습니다.');
            renderGames();
            if (isAdmin) {
                renderAdminGames();
            }
        })
        .catch(error => {
            showMessage('저장 중 오류가 발생했습니다: ' + error.message);
        });
}

function addGame() {
    const gameName = document.getElementById('newGameName').value;
    if (gameName) {
        games.push({ name: gameName, first: null, second: null, third: null });
        saveToServer()
            .then(() => {
                showMessage('새 경기가 추가되었습니다.');
                renderAdminGames();
                renderGames();
            })
            .catch(error => {
                showMessage('저장 중 오류가 발생했습니다: ' + error.message);
            });
    }
}

function saveToServer() {
    return fetch(`${BACKEND_URL}/api/games`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(games),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('서버 응답이 실패했습니다.');
        }
        return response.json();
    });
}

function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.zIndex = '1000';

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 3000);
}

function saveToLocalStorage() {
    localStorage.setItem('sportsData', JSON.stringify(games));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('sportsData');
    if (data) {
        games = JSON.parse(data);
    }
}

function addCustomScore() {
    const reason = document.getElementById('scoreReason').value;
    const scores = {};
    let hasScore = false;
    
    for (let i = 1; i <= 7; i++) {
        const score = parseInt(document.getElementById(`score${i}`).value) || 0;
        if (score !== 0) {
            scores[i] = score;
            hasScore = true;
        }
    }
    
    if (reason && hasScore) {
        games.push({
            name: reason,
            type: 'custom',
            scores: scores
        });
        saveData();
        showMessage('점수가 추가었습니다.');
    } else {
        showMessage('사유를 입력하고 최소 한 반 이상에 점수를 입력해주세요.');
    }
}

function updateCustomGame(index) {
    const gameName = document.getElementById(`gameName${index}`).value;
    const scores = {};
    for (let i = 1; i <= 7; i++) {
        const score = parseInt(document.getElementById(`score${index}_${i}`).value) || 0;
        if (score !== 0) {
            scores[i] = score;
        }
    }
    games[index] = {
        name: gameName,
        type: 'custom',
        scores: scores
    };
    saveData();
    showMessage('임의 점수가 수정되었습니다.');
}

// 로그아웃 기능 추가
function logout() {
    if (confirm('관리자 모드를 종료하시겠습니까?')) {
        isAdmin = false;
        renderGames();
        showMessage('관리자 모드가 종료되었습니다.');
    }
}

// 백엔드 URL을 환경 변수에서 가져옴
const BACKEND_URL = window.location.origin;
