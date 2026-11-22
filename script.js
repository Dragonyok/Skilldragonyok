let currentLevel = 1;
let unlockedLevel = 1;
let boardSize = 4;
let playerPos = { x: 0, y: 0 };
let goalPos = { x: 3, y: 3 };
let obstacles = [];
let coins = [];
let levelCleared = false; // ⭐ ตัวแปรสำหรับเช็คว่าด่านนี้บันทึกคะแนนไปหรือยัง

// ข้อมูล 10 ด่าน
const levelsData = {
    1:  { size: 4, goal: { x: 3, y: 3 }, obstacles: [], coins: [{ x: 1, y: 1, collected: false }] },
    2:  { size: 4, goal: { x: 3, y: 0 }, obstacles: [{ x: 1, y: 1 }], coins: [{ x: 2, y: 2, collected: false }] },
    3:  { size: 4, goal: { x: 0, y: 3 }, obstacles: [{ x: 1, y: 1 }, { x: 2, y: 1 }], coins: [{ x: 3, y: 1, collected: false }, { x: 0, y: 2, collected: false }] },
    4:  { size: 5, goal: { x: 4, y: 4 }, obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], coins: [{ x: 0, y: 4, collected: false }, { x: 4, y: 0, collected: false }] },
    5:  { size: 5, goal: { x: 0, y: 4 }, obstacles: [{ x: 1, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }], coins: [{ x: 2, y: 2, collected: false }, { x: 4, y: 0, collected: false }] },
    6:  { size: 5, goal: { x: 4, y: 0 }, obstacles: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], coins: [{ x: 2, y: 0, collected: false }, { x: 2, y: 4, collected: false }] },
    7:  { size: 5, goal: { x: 2, y: 2 }, obstacles: [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 3 }], coins: [{ x: 0, y: 0, collected: false }, { x: 4, y: 4, collected: false }, { x: 2, y: 0, collected: false }] },
    8:  { size: 6, goal: { x: 5, y: 5 }, obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }], coins: [{ x: 0, y: 5, collected: false }, { x: 5, y: 0, collected: false }, { x: 3, y: 2, collected: false }] },
    9:  { size: 6, goal: { x: 0, y: 5 }, obstacles: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }], coins: [{ x: 5, y: 0, collected: false }, { x: 2, y: 5, collected: false }, { x: 5, y: 5, collected: false }] },
    10: { size: 6, goal: { x: 5, y: 0 }, obstacles: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }], coins: [{ x: 5, y: 5, collected: false }, { x: 0, y: 5, collected: false }, { x: 2, y: 0, collected: false }, { x: 5, y: 3, collected: false }] }
};

// ฟังก์ชันสำหรับปุ่มหน้าแรก (รีเซ็ตกลับมาด่าน 1)
function goToHome() {
    currentLevel = 1;
    renderLevelButtons();
    changeLevel(1);
    document.getElementById('status').innerHTML = 'สถานะ: กลับมาที่หน้าแรกแล้ว เลือกด่านได้เลย!';
}

function renderLevelButtons() {
    const selector = document.getElementById('level-selector');
    selector.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.id = `btn-lvl-${i}`;
        btn.classList.add('lvl-btn');
        if (i === currentLevel) btn.classList.add('active');
        
        if (i > unlockedLevel) {
            btn.disabled = true;
            btn.innerHTML = `🔒 ${i}`;
        } else {
            btn.innerHTML = `ด่าน ${i}`;
            btn.onclick = () => changeLevel(i);
        }
        selector.appendChild(btn);
    }
}

function changeLevel(lvl) {
    if (lvl > unlockedLevel) return;
    currentLevel = lvl;

    const data = levelsData[lvl];
    boardSize = data.size;
    goalPos = { ...data.goal };
    obstacles = data.obstacles.map(o => ({ ...o }));
    coins = data.coins.map(c => ({ ...c, collected: false }));
    
    levelCleared = false; // ⭐ รีเซ็ตสถานะการผ่านด่านเมื่อเปลี่ยนด่าน

    renderLevelButtons();
    resetGame();
}

function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            if (x === playerPos.x && y === playerPos.y) {
                cell.innerHTML = '🤖';
            } else if (x === goalPos.x && y === goalPos.y) {
                cell.innerHTML = '⭐';
                cell.classList.add('goal');
            } else if (isObstacle(x, y)) {
                cell.innerHTML = '🚧';
                cell.classList.add('obstacle');
            } else {
                const coin = coins.find(c => c.x === x && c.y === y && !c.collected);
                if (coin) {
                    cell.innerHTML = '🪙';
                }
            }
            board.appendChild(cell);
        }
    }
    updateScore();
}

function isObstacle(x, y) {
    return obstacles.some(obs => obs.x === x && obs.y === y);
}

function movePlayer(direction) {
    // ถ้าผ่านด่านนี้ไปแล้ว ไม่ต้องให้เดินต่อ (หรือจะปล่อยให้เดินเล่นก็ได้)
    // if (levelCleared) return; 

    let newX = playerPos.x;
    let newY = playerPos.y;

    if (direction === 'UP' && playerPos.y > 0) newY--;
    if (direction === 'DOWN' && playerPos.y < boardSize - 1) newY++;
    if (direction === 'LEFT' && playerPos.x > 0) newX--;
    if (direction === 'RIGHT' && playerPos.x < boardSize - 1) newX++;

    if (isObstacle(newX, newY)) {
        document.getElementById('status').innerHTML = '💥 ชนกำแพง! ลองใหม่อีกครั้งนะ';
        document.getElementById('status').style.color = 'red';
        return;
    }

    playerPos.x = newX;
    playerPos.y = newY;

    coins.forEach(coin => {
        if (!coin.collected && coin.x === playerPos.x && coin.y === playerPos.y) {
            coin.collected = true;
            document.getElementById('status').innerHTML = '✨ เยี่ยม! ได้เหรียญแล้ว';
            document.getElementById('status').style.color = 'orange';
        }
    });

    initBoard();
    checkWin();
}

function updateScore() {
    const collectedCount = coins.filter(c => c.collected).length;
    document.getElementById('score').innerHTML = `เหรียญในด่านนี้: ${collectedCount} / ${coins.length}`;
}

function checkWin() {
    const status = document.getElementById('status');
    const allCoinsCollected = coins.every(c => c.collected);

    if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
        if (allCoinsCollected) {
            if (!levelCleared) {
                // ⭐ ทำงานเมื่อผ่านด่านครั้งแรกของรอบนั้น
                levelCleared = true;
                status.innerHTML = `🎉 ยอดเยี่ยม! ผ่านด่าน ${currentLevel} แล้ว!`;
                status.style.color = 'green';

                // ⭐ คำนวณคะแนนและส่งไปบันทึกที่ Firebase
                // สมมติว่า 1 เหรียญ = 10 คะแนน
                const earnedScore = coins.length * 10; 
                if (typeof saveCodingScore === 'function') {
                    saveCodingScore(earnedScore);
                }
            }

            // ปลดล็อกด่านถัดไป
            if (currentLevel === unlockedLevel && unlockedLevel < 10) {
                unlockedLevel++;
                renderLevelButtons();
            }
        } else {
            status.innerHTML = '⚠️ ยังเก็บเหรียญไม่ครบ ไปเก็บเหรียญ 🪙 ให้หมดก่อน!';
            status.style.color = '#d69e2e';
        }
    }
}

function resetGame() {
    playerPos = { x: 0, y: 0 };
    coins.forEach(c => c.collected = false);
    levelCleared = false; // ⭐ รีเซ็ตสถานะเมื่อเริ่มด่านใหม่
    
    document.getElementById('status').innerHTML = `สถานะ: กำลังลุยด่านที่ ${currentLevel}`;
    document.getElementById('status').style.color = '#333';
    initBoard();
}

// เริ่มต้นเปิดเกมที่ด่าน 1
renderLevelButtons();
changeLevel(1);