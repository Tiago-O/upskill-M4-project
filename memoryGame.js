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
        switchIcons(i, tempDiv);
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
            insertCardIcons(r, c, cell)
            cell.children().hide(); // Hide all svg
            cell.click(function(){
            // Does not let select more than two cards, the same card or disabled card.
            if(selectionAvailable === true && cell !== cardCellSelection[cardSelectionCounter] && cardValues[r][c] !== -1) {
                cardSelectionCounter++;
                cardSelection[cardSelectionCounter] = cardValues[r][c];
                cardCellSelection[cardSelectionCounter] = cell;
                cardSelectionId[cardSelectionCounter] = [r,c];
                cell.children().show(); // Show selected svg.
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
                        $('.grid-card>svg').hide();// Hide all svg after selection
                        // Win:
                        if(cardSelection[0] === cardSelection[1] ) {
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

function insertCardIcons(r, c, cell) {
    switchIcons(cardValues[r][c], cell)
}

function switchIcons(iconId, temporaryDiv) {
    switch (iconId) {
        case(0): // Rocket
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-rocket" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path>
                <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path>
                <circle cx="15" cy="9" r="1"></circle>
            </svg>`)
            break
        case(1): // Bat
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bat" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M17 16c.74 -2.286 2.778 -3.762 5 -3c-.173 -2.595 .13 -5.314 -2 -7.5c-1.708 2.648 -3.358 2.557 -5 2.5v-4l-3 2l-3 -2v4c-1.642 .057 -3.292 .148 -5 -2.5c-2.13 2.186 -1.827 4.905 -2 7.5c2.222 -.762 4.26 .714 5 3c2.593 0 3.889 .952 5 4c1.111 -3.048 2.407 -4 5 -4z"></path>
                <path d="M9 8a3 3 0 0 0 6 0"></path>
            </svg>`)
            break
        case(2): // Ray
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bolt" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <polyline points="13 3 13 10 19 10 11 21 11 14 5 14 13 3"></polyline>
            </svg>`)
            break
        case(3): // Bow and arrow
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bow" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M17 3h4v4"></path>
                <path d="M21 3l-15 15"></path>
                <path d="M3 18h3v3"></path>
                <path d="M16.5 20c1.576 -1.576 2.5 -4.095 2.5 -6.5c0 -4.81 -3.69 -8.5 -8.5 -8.5c-2.415 0 -4.922 .913 -6.5 2.5l12.5 12.5z"></path>
            </svg>`)
            break
        case(4): // Bug
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bug" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M9 9v-1a3 3 0 0 1 6 0v1"></path>
                <path d="M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1 -10 0v-3a6 6 0 0 1 1 -3"></path>
                <line x1="3" y1="13" x2="7" y2="13"></line>
                <line x1="17" y1="13" x2="21" y2="13"></line>
                <line x1="12" y1="20" x2="12" y2="14"></line>
                <line x1="4" y1="19" x2="7.35" y2="17"></line>
                <line x1="20" y1="19" x2="16.65" y2="17"></line>
                <line x1="4" y1="7" x2="7.75" y2="9.4"></line>
                <line x1="20" y1="7" x2="16.25" y2="9.4"></line>
            </svg>`)
            break
        case(5): // Castle
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-building-castle" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M15 19v-2a3 3 0 0 0 -6 0v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-14h4v3h3v-3h4v3h3v-3h4v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path>
                <line x1="3" y1="11" x2="21" y2="11"></line>
            </svg>`)
            break
        case(6): // Cactus
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-cactus" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M6 9v1a3 3 0 0 0 3 3h1"></path>
                <path d="M18 8v5a3 3 0 0 1 -3 3h-1"></path>
                <path d="M10 21v-16a2 2 0 1 1 4 0v16"></path>
                <path d="M7 21h10"></path>
            </svg>`)
            break
        case(7): // Candy
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-candy" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M7.05 11.293l4.243 -4.243a2 2 0 0 1 2.828 0l2.829 2.83a2 2 0 0 1 0 2.828l-4.243 4.243a2 2 0 0 1 -2.828 0l-2.829 -2.831a2 2 0 0 1 0 -2.828z"></path>
                <path d="M16.243 9.172l3.086 -.772a1.5 1.5 0 0 0 .697 -2.516l-2.216 -2.217a1.5 1.5 0 0 0 -2.44 .47l-1.248 2.913"></path>
                <path d="M9.172 16.243l-.772 3.086a1.5 1.5 0 0 1 -2.516 .697l-2.217 -2.216a1.5 1.5 0 0 1 .47 -2.44l2.913 -1.248"></path>
            </svg>`)
            break
        case(8): // Pine tree
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-christmas-tree" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 3l4 4l-2 1l4 4l-3 1l4 4h-14l4 -4l-3 -1l4 -4l-2 -1z"></path>
                <path d="M14 17v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-3"></path>
            </svg>`)
            break
        case(9): // Web
            temporaryDiv.append(`<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chart-radar" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 3l9.5 7l-3.5 11h-12l-3.5 -11z"></path>
                <path d="M12 7.5l5.5 4l-2.5 5.5h-6.5l-2 -5.5z"></path>
                <path d="M2.5 10l9.5 3l9.5 -3"></path>
                <path d="M12 3v10l6 8"></path>
                <path d="M6 21l6 -8"></path>
            </svg>`)
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
            $('#table-icons-container>svg').eq(i).css('color', 'rgba(134,75,162,0.25)');
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