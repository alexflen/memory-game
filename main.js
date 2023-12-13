let allCards = []
let imgExtension = ".png"
let field = document.getElementById("field");
let cntCardsRow = 3;
let cntCardsCol = 4;
let cellToCard = [];
let openedCards = [];
let isEliminated = [];
let gameStarted = false;
let catPath = "./resources/img/cats/";

function getRand(leftBound, rightBound) {
    return Math.floor(Math.random() * (rightBound - leftBound + 1)) + leftBound;
}

function randomShuffle(array) {
    let result = array;
    for (let i = array.length - 1; i > 0; i--) {
        let j = getRand(0, i);
        let temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }

    return result
}

const checkImgExistence = async (imgNum) => {
    return (await fetch(catPath + imgNum + imgExtension, {method: 'HEAD'}).then((res) => res.ok, () => false));
}

const initCardPool = async() => {
    let leftBound = 0, rightBound = 255;
    while (leftBound + 1 < rightBound) {
        let mid = ~~((leftBound + rightBound) / 2);
        let imgFound = false;
        await checkImgExistence(mid).then(found => {
            if (found) {
                imgFound = true;
            }
        });

        if (imgFound) {
            leftBound = mid;
        } else {
            rightBound = mid;
        }
    }

    for (let imgNum = 0; imgNum <= leftBound; imgNum++) {
        allCards.push(imgNum + imgExtension);
    }
}

function assignCards(cntCardsRow, cntCardsCol) {
    console.assert(cntCardsCol * cntCardsRow % 2 === 0);
    let cardPool = randomShuffle(allCards).slice(0, cntCardsRow * cntCardsCol / 2);
    let cardDistribution = randomShuffle(cardPool.concat(cardPool));
    cellToCard = [];

    for (let row = 0; row < cntCardsRow; row++) {
        cellToCard.push([]);
        for (let col = 0; col < cntCardsCol; col++) {
            cellToCard[row].push(cardDistribution[row * cntCardsCol + col]);
        }
    }
}

function buildGame() {
    document.getElementById("container-finished").style.visibility = "hidden";
    document.getElementById("container-settings").style.visibility = "hidden";
    document.getElementById("give-up-button").style.visibility = "visible";

    field.innerHTML = "";
    assignCards(cntCardsRow, cntCardsCol);

    let width = window.innerWidth * 0.8;
    let height = window.innerHeight * 0.7;

    const cardBaseHeight = 496, cardBaseWidth = 368;

    let cardWidth = width / (1.1 * cntCardsCol + 0.1);
    let cardHeight = cardWidth * cardBaseHeight / cardBaseWidth;
    if (cardHeight > height / (1.1 * cntCardsRow + 0.1)) {
        cardHeight = height / (1.1 * cntCardsRow + 0.1);
        cardWidth = cardHeight * cardBaseWidth / cardBaseHeight;
    }

    field.style.gridTemplateColumns = `repeat(${cntCardsCol}, ${cardWidth}px)`;
    field.style.gridTemplateRows = `repeat(${cntCardsRow}, ${cardHeight}px)`;

    openedCards = [];
    isEliminated = [];
    for (let row = 0; row < cntCardsRow; row++) {
        isEliminated.push([]);
        for (let col = 0; col < cntCardsCol; col++) {
            isEliminated[row].push(false);
            let htmlCard = `<img src='./resources/img/cardback/default.png' alt="cardback" class="card" id="card-${row}-${col}"/>`
            field.insertAdjacentHTML('beforeend', htmlCard);
        }
    }

    gameStarted = true;
}

function flipCard(row, col) {
    let indexInOpened = openedCards.findIndex((element) => element[0] === row && element[1] === col);
    let card = document.getElementById(`card-${row}-${col}`);
    if (indexInOpened !== -1) {
        card.src = './resources/img/cardback/default.png';
        openedCards.splice(indexInOpened, 1);
    } else {
        card.src = catPath + cellToCard[row][col];
        openedCards.push([row, col]);
    }
}

function isFieldCleared() {
    for (let row = 0; row < cntCardsRow; row++) {
        for (let col = 0; col < cntCardsCol; col++) {
            if (!isEliminated[row][col]) return false;
        }
    }

    return true;
}

function offerRestart(didWin) {
    gameStarted = false;
    if (didWin) {
        document.getElementById("text-finished").innerText = "Congratulations!";
    } else {
        document.getElementById("text-finished").innerText = "Oops.. Maybe try changing settings?";
    }

    document.getElementById("give-up-button").style.visibility = "hidden";
    document.getElementById("container-finished").style.visibility = "visible";
}

function eliminateCard(row, col) {
    let card = document.getElementById(`card-${row}-${col}`);
    card.src = './resources/img/cardback/empty.png';
    isEliminated[row][col] = true;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

const onSecondFlippedCard = async (row, col) => {
    flipCard(row, col);
    if (openedCards.length > 0) {
        let firstCard = openedCards[0], secondCard = openedCards[1];
        let rowFirst = firstCard[0], rowSecond = secondCard[0];
        let colFirst = firstCard[1], colSecond = secondCard[1];
        if (cellToCard[rowFirst][colFirst] === cellToCard[rowSecond][colSecond]) {
            await delay(200);
            eliminateCard(rowFirst, colFirst);
            eliminateCard(rowSecond, colSecond);

            openedCards = [];

            if (isFieldCleared()) {
                offerRestart(true);
            }

            return;
        }

        await delay(800);

        flipCard(rowFirst, colFirst);
        flipCard(rowSecond, colSecond);
    }
}

field.addEventListener("click", function (event) {
    if (gameStarted) {
        for (let row = 0; row < cntCardsRow; row++) {
            for (let col = 0; col < cntCardsCol; col++) {
                if (isEliminated[row][col]) continue;

                let card = document.getElementById(`card-${row}-${col}`);
                if (card.contains(event.target)) {
                    if (openedCards.length === 0) {
                        flipCard(row, col);
                    } else if (openedCards.length === 1) {
                        onSecondFlippedCard(row, col).then(_ => {
                        });
                    }
                }
            }
        }
    }
})

function openSettings() {
    document.getElementById("container-settings").style.visibility = "visible";
}

function removeIfDisplayed(id) {
    let getById = document.getElementById(id);
    if (getById != null) {
        getById.remove();
    }
}

function closeSettings() {
    document.getElementById("height-input").value = cntCardsRow;
    document.getElementById("width-input").value = cntCardsCol;
    removeIfDisplayed("settings-error");

    document.getElementById("container-settings").style.visibility = "hidden";
}

function applySettings() {
    removeIfDisplayed("settings-error");

    let newHeight = document.getElementById("height-input").value;
    let newWidth = document.getElementById("width-input").value;
    let errorMessage = null;

    if ((newHeight * newWidth) % 2 !== 0) {
        errorMessage = `total number of cards must be even`;
    } else if (newHeight * newWidth > 2 * allCards.length) {
        errorMessage = `the field is too large`;
    } else if (newHeight <= 0 || newWidth <= 0) {
        errorMessage = `the dimensions of the field must be positive`;
    } else {
        cntCardsCol = newWidth;
        cntCardsRow = newHeight;
        closeSettings();
    }

    if (errorMessage != null) {
        document.getElementById("container-settings").insertAdjacentHTML("beforeend", `<div class="text" id="settings-error">Can't apply settings: ${errorMessage}</div>`);
    }
}

window.onload =  function () {
    initCardPool().then(_ => buildGame());
}