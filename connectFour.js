// game Connect Four

// starting board
let board = [
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0]
];

// load history from Local Storage
let retrievedData = localStorage.getItem('history');
let history = JSON.parse(retrievedData);
if(!history) {
    history = [];
}
console.log(history);

// play: 0 - 6 (index) > iPlay
// player: number 1 or number 2
let player;
// div win-player-name !== victor player
let winPlayerName = $('#win-player-name');

// what happens with every play
// (board and player are global variables)
function boardAfterPlay(iPlay) {
    for (let i = 0; i < board.length; i++) {
        if (board[i][iPlay] === 0) {
            board[i][iPlay] = player;
            let colRow = $(`#col_${iPlay}_row_${i}`);

            // colRow.eq(0).removeClass("ball-player-0").addClass(`ball-player-${player}`);

            colRow.empty();
            colRow.append(`<div class="ball-player ball-player-${player}"></div>`)

            let winner = victory(board);
            if (winner !== 0) {
                // victory
                gameOver = true;
                victoryBox.show();
                playSound('success_003');

                // text in victory box
                let victor;
                winner === 1 ? victor = player1InputName.val() : victor = player2InputName.val();
                winPlayerName.text(`${victor} won!!`)

                // stops setInterval
                clearInterval(intervalId);
                // shows time at the end of game (mm, ss: global variables)
                showTimer(mm, ss);

                // update history list with an object
                history.push({
                    game: 'Connect Four',
                    winner: victor,
                    player1: player1InputName.val(),
                    player2: player2InputName.val(),
                    gameTime: `${mm}:${ss}`,
                    timestamp: Date.now()
                });

                // save to Local Storage
                localStorage.setItem("history", JSON.stringify(history));
                console.log(history);

            } else if (fullBoard(board)) {
                // no victory > but the board is full
                gameOver = true;
                victoryBox.show();
                winPlayerName.text('It is a draw.')
                playSound('success_001');

                // stops setInterval
                clearInterval(intervalId);
                // shows time at the end of game
                showTimer(mm, ss);

                // update history list with an object
                history.push({
                    game: 'connect-four',
                    winner: victor,
                    player1: player1InputName.val(),
                    player2: player2InputName.val(),
                    gameTime: `${mm}:${ss}`,
                    timestamp: Date.now()
                });

                // save to Local Storage
                localStorage.setItem("history", JSON.stringify(history));
                console.log(history);

            } else {
                // no victory > game continues
                player = nextToPlay(player);
                boxPlayer.eq(player - 1).addClass("box-player-name-playing");
                boxPlayer.eq(nextToPlay(player) - 1).removeClass("box-player-name-playing");
            }

            return;
        }
    }
}

// returns 0 if no victory, or the winning player number (1 or 2)
function victory(board) {
    // lines
    for (let l = board.length - 1; l >= 0; l--) {
        for (let c = 0; c < 4; c++) {
            if (board[l][c] !== 0 && board[l][c] === board[l][c + 1] && board[l][c + 1] === board[l][c + 2] && board[l][c + 2] === board[l][c + 3]) {
                return board[l][c];
            }
        }
    }
    // columns
    for (let l = board.length - 1; l > board.length - 4; l--) {
        for (let c = 0; c < board[0].length; c++) {
            if (board[l][c] !== 0 && board[l][c] === board[l - 1][c] && board[l - 1][c] === board[l - 2][c] && board[l - 2][c] === board[l - 3][c]) {
                return board[l][c];
            }
        }
    }
    // up diagonals
    for (let l = 0; l < board.length - 4; l++) {
        for (let c = 0; c < board[0].length - 3; c++) {
            if (board[l][c] !== 0 && board[l][c] === board[l + 1][c + 1] && board[l + 1][c + 1] === board[l + 2][c + 2] && board[l + 2][c + 2] === board[l + 3][c + 3]) {
                return board[l][c];
            }
        }
    }
    // down diagonals
    for (let l = board.length - 3; l < board.length; l++) {
        for (let c = 0; c < board[0].length - 3; c++) {
            if (board[l][c] !== 0 && board[l][c] === board[l - 1][c + 1] && board[l - 1][c + 1] === board[l - 2][c + 2] && board[l - 2][c + 2] === board[l - 3][c + 3]) {
                return board[l][c];
            }
        }
    }
    // no victory
    return 0;
}

// is the board full of pieces?
function fullBoard(board) {
    return !board[board.length - 1].includes(0);
}

// Random 1st player
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function randomFirstPlayer() {
    return Math.floor(Math.random() * 2) + 1;
}

// next to play player
function nextToPlay(last) {
    return last === 1 ? 2 : 1;
}

// is it a new game?
function newGame(board) {
    board[0].forEach(function (el) {
        if (el !== 0) {
            return false;
        }
    });
    return true;
}

// GAME running

let connectFourGrid = $('#connect-four-grid');
let boxPlayer = $('.box-player-name');

// if new game > 1st to play is random
if (newGame(board)) {
        player = randomFirstPlayer();
        boxPlayer.eq(player - 1).addClass("box-player-name-playing");
    } else {
        player = nextToPlay(player);
    }

// NEW GAME GRID
function newGameGrid() {
    // empty the grid
    connectFourGrid.empty();

    // for cols
    for (let i = 0; i < board[0].length; i++) {
        let col = $(`<div id="col_${i}" class="connect-four-col"></div>`);

        col.click(() => {
            if(!gameOver) {
                boardAfterPlay(i);
                playSound('short_tone_004');
            }
        });

        //for rows
        for (let j = board.length - 1; j >= 0; j--) {
            //append rows to col
            col.append(`<div id="col_${i}_row_${j}" class="connect-four-row">
            <div class="ball-player ball-player-0"></div>
        </div>`)
        }
        // append rows with cols to connect four grid
        connectFourGrid.append(col);
    }
}

let connectFourMenu = $('#connect-four-menu');
let gameArea = $('#game-area');
let startGameButton = $('#start-game');

let player1InputName = $('#p1-name');
let player2InputName = $('#p2-name');
let boxPlayer1DivName = $('#name-player1');
let boxPlayer2DivName = $('#name-player2');

let victoryBox = $('#box-win');
let playAgain = $('#box-win-play-again-button');

if (connectFourMenu.show()) {
    gameArea.hide();
    victoryBox.hide();
}

// START GAME Button
startGameButton.click(function () {

    // removes class invalid if user starts writing
    player1InputName.on("input", function () {
        player1InputName.removeClass("is-invalid");
    })

    player2InputName.on("input", function () {
        player2InputName.removeClass("is-invalid");
    })

    // check players names validity
    let formValid = true;
    if(!player1InputName[0].checkValidity()) {
        player1InputName.addClass("is-invalid");
        formValid = false;
    }
    if(!player2InputName[0].checkValidity()) {
        player2InputName.addClass("is-invalid");
        formValid = false;
    }
    if(!formValid) {
        return;
    }

    // if all ok > insert player names
    boxPlayer1DivName.text(player1InputName.val());
    boxPlayer2DivName.text(player2InputName.val());

    newGameGrid();
    gameArea.show();
    connectFourMenu.hide();

    // starts the timer
    startTimer();
    // game is ON
    gameOver = false;
});

// END GAME / PLAY AGAIN Button
playAgain.click(function () {
    // clean board
    board = [
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0]
    ];
    $(".connect-four-row").empty()

    // clean names in game menu? no

    gameArea.hide();
    victoryBox.hide();
    connectFourMenu.show();
});

// TIMER

let timer = $('#timer');
let intervalId;
let ss;
let mm;

function startTimer() {
    timer.text('00 : 00');
    let seconds = 0;
    let minutes = 0;

    intervalId = setInterval(displayTimer, 1000);

    function displayTimer() {
        seconds += 1;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }

        ss = seconds;

        if (seconds <= 9) {
            ss = `0${seconds}`;
        }

        mm = minutes

        if (minutes <= 9) {
            mm = `0${minutes}`;
        }

        showTimer(mm, ss);
    }
}

function showTimer(mm, ss) {
    timer.text(`${mm} : ${ss}`);
}

// SOUNDS
function playSound(soundName) {
    let audio = new Audio(`audio/${soundName}.mp3`);
    audio.play();
}
