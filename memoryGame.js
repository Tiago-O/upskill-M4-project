// ## Global variables:

// # Query selectors:
let startButton = $('#startButton');
let playerName = $('#playerName');
let body = $('body');
let form = $('form');

// # Save cards values:
// 0-9 - cards values available;
// -1 - card selected.
let cardValues = [];

// # Timer variables:
let setTimer;
let minutes = '00';
let seconds = '00';

// # Input values:
let playerNameValue = '';
let levelValue = '';

// # Grid rows x columns:
let totalGridRows;
let totalGridColumns;


startButton.click(startGame);

function startGame() {
    getInputValues() // Get player name and select level.
    if(checkFormValidity()) { // Check if form is fill.
        updateCardGridDimension() // Assign total number of rows and columns.
        assignRandomCardsValues(); // Create cards values dynamically.
        hidePageContent(); // Hide form and main title.
        displayInfoBox(); // Show player name, level and timer.
        displayTableIcons(); // Show table with icons content.
        displayCards(); // Show grid cards dynamically.
        startTimer();
        playSound(`start`);
    }
}

function getInputValues() {
    playerNameValue = playerName.val();
    levelValue = form[0].level.value;
}

function checkFormValidity() {
    return !(playerNameValue === '' || levelValue === '');
}

function updateCardGridDimension() {
    assignTotalRows()
    assignTotalColumns()
}

function assignTotalRows() {
    totalGridRows = 4;
    if(levelValue === 'easy') {
        totalGridRows = 3;
    }
}

function assignTotalColumns() {
    totalGridColumns = 4;
    if(levelValue === 'advanced'){
        totalGridColumns = 5;
    }
}

function assignRandomCardsValues() {
    let counterValues = []; // Maximum 2 values of the same type.
    let totalTypes = [];
    // * Easy: 6 card types.
    // * Medium: 8 card types.
    // * Advanced: 10 card types.
    totalTypes.length = getTotalIconsTypes();

    // Reset variables:
    for (let i = 0; i < totalTypes.length; i++) {
        counterValues[i] = 0;
        totalTypes[i] = i;
    }

    // Assign random cards values:
    for (let r = 0; r < totalGridRows; r++) {
        cardValues[r] = [];
        for (let c = 0; c < totalGridColumns; c++) {
            cardValues[r][c] = randomCardValue(totalTypes)
            counterValues[cardValues[r][c]]++ // Increment counter values.
            if(counterValues[cardValues[r][c]] >= 2 ) {
                totalTypes = totalTypes.filter(function(value) {
                    return value !== cardValues[r][c]; // Remove type value.
                })
            }
        }
    }
    //console.log(cardValues)
}

function getTotalIconsTypes() {
    if(levelValue ==='easy') {
        return 6;
    } else if(levelValue === 'medium') {
        return 8;
    } else if(levelValue === 'advanced') {
        return 10;
    }
}

function randomCardValue(totalTypes) {
    // Return random value between 0 and totalTypes.length:
    return totalTypes[Math.floor( Math.random() * totalTypes.length)];
}

function hidePageContent() {
    form.hide();
    $('h1').hide(); // 'Memory Game' title
}

function displayInfoBox() {
    body.append(`<div>
        <h2>Welcome ${playerNameValue}!</h2>
        <h3>Level : ${levelValue}</h3>
        <div id="timer"></div>
    </div>`)
}

function displayTableIcons() {
    body.append(`<div id="table-icons-container">`);
    let tempDiv = $('#table-icons-container');
    let totalIcons = getTotalIconsTypes();

    for (let i = 0; i < totalIcons; i++) {
        insertCardIcons(i, tempDiv);
    }
}

function displayCards() {
    body.append(`<div id="grid-container" class="grid-${levelValue}"></div>`)
    let grid = $('#grid-container');
    // ## Variables to control selection:
    let selectionAvailable = true
    // true - cards available for selection
    // false - cards selected
    let cardSelectionCounter = -1;
    // # Get the index of card(s) selected (max 2 cards picked):
    // -1 - reset;
    // 0 - first card selected;
    // 1 - second card selected.
    let cardSelection = [-1,-1];
    // # Get the value(s) of card(s) selected.
    // -1 - reset;
    // 0-9 - values.
    let cardCellSelection = [-1,-1];
    // # Get the cell of card(s) selected.
    // -1 - reset;
    // cell.
    let cardSelectionId = [-1,-1];
    // # Get the r and c of cardValues selected.
    // -1 - reset;
    // [r,c].
    let audioWinCounter = 0;

    for (let r = 0; r < totalGridRows; r++) {
        for (let c = 0; c < totalGridColumns; c++) {

            let cell = $(`<div class="grid-card" ></div>`);
            insertCardIcons(cardValues[r][c], cell)
            cell.children().hide(); // Hide all images
            cell.click(function(){
            // Does not let select more than two cards, the same card or disabled card.
            if(selectionAvailable === true && cell !== cardCellSelection[cardSelectionCounter] && cardValues[r][c] !== -1) {
                cardSelectionCounter++;
                cardSelection[cardSelectionCounter] = cardValues[r][c];
                cardCellSelection[cardSelectionCounter] = cell;
                cardSelectionId[cardSelectionCounter] = [r,c];

                cell.addClass("active")
                setTimeout(function(){
                    cell.removeClass("active");
                    cell.children().show(); // Show selected icon image.
                }, 200)
                // Two cards selected:
                if(cardSelectionCounter === 1) {
                    selectionAvailable = false
                    // Show selection results:
                    setTimeout(() => {
                        // Win:
                        if(cardSelection[0] === cardSelection[1] ) {
                            // Cards highlight:
                            cardCellSelection[0].css('background-color', '#f6f1da');
                            cardCellSelection[1].css('background-color', '#f6f1da');
                            // Sound:
                            audioWinCounter++
                            playSound(`win${audioWinCounter}`);
                            if(audioWinCounter === 3) {
                                audioWinCounter = 0; // Reset win audio counter
                            }
                            // Reset cards values:
                            cardValues[cardSelectionId[0][0]][cardSelectionId[0][1]] = -1
                            cardValues[cardSelectionId[1][0]][cardSelectionId[1][1]] = -1
                        // Lose:
                        } else {
                            // Cards lowlight
                            cardCellSelection[0].css('background-color', '#cd915c');
                            cardCellSelection[1].css('background-color', '#cd915c');
                            // Sound:
                            playSound(`lose`);
                        }
                    }, 250);
                    // Selection over:
                    setTimeout(() => {
                        $('.grid-card>img').hide();// Hide all images after selection
                        // Win:
                        if(cardSelection[0] === cardSelection[1]) {
                            // Disabled cards
                            cardCellSelection[0].css('background-color', 'hsla(225,97%,26%,0.13)');
                            cardCellSelection[1].css('background-color', 'hsla(225,97%,26%,0.13)');
                            // Disabled table icon
                            disabledTableIcon(cardSelection[0])
                        // Lose:
                        } else {
                            // Cards available to selection again
                            cardCellSelection[0].css('background-color', '#f6c333');
                            cardCellSelection[1].css('background-color', '#f6c333');
                        }
                        // Reset variables
                        selectionAvailable = true
                        cardSelectionCounter = -1
                        cardSelection[0] = -1
                        cardSelection[1] = -1
                        cardCellSelection[0] = -1
                        cardCellSelection[1] = -1
                        cardSelectionId = [-1,-1]
                        if(checkGameIsOver() === true) {
                            clearInterval(setTimer); // Stop timer
                            displayPopUp();
                            gameHistoryReport();
                        }
                    }, 1250);
                }
            }
        });
        grid.append(cell)
    }
    grid.append(`</div>`)
    }
}

function insertCardIcons(iconId, temporaryDiv) {
    switch (iconId) {
        case(0): // Rocket
            temporaryDiv.append(`<img src="images/memory_game_icons/0.svg" alt="Rocket">`)
            break
        case(1): // Bat
            temporaryDiv.append(`<img src="images/memory_game_icons/1.svg" alt="Bat">`)
            break
        case(2): // Ray
            temporaryDiv.append(`<img src="images/memory_game_icons/2.svg" alt="Ray">`)
            break
        case(3): // Bow and arrow
            temporaryDiv.append(`<img src="images/memory_game_icons/3.svg" alt="Bow and arrow">`)
            break
        case(4): // Bug
            temporaryDiv.append(`<img src="images/memory_game_icons/4.svg" alt="Bug">`)
            break
        case(5): // Castle
            temporaryDiv.append(`<img src="images/memory_game_icons/5.svg" alt="Castle">`)
            break
        case(6): // Cactus
            temporaryDiv.append(`<img src="images/memory_game_icons/6.svg" alt="Cactus">`)
            break
        case(7): // Candy
            temporaryDiv.append(`<img src="images/memory_game_icons/7.svg" alt="Candy">`)
            break
        case(8): // Pine tree
            temporaryDiv.append(`<img src="images/memory_game_icons/8.svg" alt="Pine tree">`)
            break
        case(9): // Web
            temporaryDiv.append(`<img src="images/memory_game_icons/9.svg" alt="Web">`)
            break
    }
}

function startTimer() {
    let timer = $('#timer');
    timer.text(`${minutes} : ${seconds}`);
    setTimer = setInterval(function() {
        seconds++;
        if (seconds < 10) {
            seconds = '0' + seconds;
        } else if (seconds === 60) {
            seconds = '00'
            minutes++;
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
        }
        timer.text(`${minutes} : ${seconds}`);
    }, 1000);
}

function playSound(soundName) {
    let audio = new Audio(`audio/${soundName}.mp3`);
    audio.play();
}

function disabledTableIcon(cardSelection) {
    for (let i = 0; i < getTotalIconsTypes(); i++) {
        if(cardSelection === i) {
            $('#table-icons-container>img').eq(i).fadeTo("slow", 0.33);
        }
    }
}

function checkGameIsOver() {
    let totalCards = totalGridRows * totalGridColumns;
    let cardAvailable = totalCards;
    for (let r = 0; r < totalGridRows; r++) {
        for (let c = 0; c < totalGridColumns; c++) {
            if(cardValues[r][c] > -1) {
                cardAvailable--;
            }
        }
    }
    return cardAvailable === totalCards;
}

function displayPopUp() {
    $(`h2`).before(`<div id='pop-up-container'>
        <div id='pop-up'>
        <h1 id='pop-up-title'>Congratulations!</h1>
            <span>
                <button type="button" onclick="location.href='menu.html';">Menu</button>
                <button type="button" onclick="location.href='memoryGame.html';">Restart</button>
            </span>
        </div>
    </div>`)
    playSound('end');
}

function gameHistoryReport() {
    // Load history from Local Storage
    let retrievedData = localStorage.getItem('history');
    let history = JSON.parse(retrievedData);
    if(!history) {
        history = [];
    }

    history.push({
        game: 'Memory Game',
        player: `${playerNameValue}`,
        gameTime: `${minutes}:${seconds}`,
        timestamp: Date.now()
    });

    // Save to Local Storage
    localStorage.setItem("history", JSON.stringify(history));
}