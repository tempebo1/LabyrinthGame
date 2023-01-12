function drawBoard() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    makeBorder();
    makeArrows();
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            drawRoom(grid[i][j]);
        }
    }
    drawRoom(game.slidingPiece);
    for (let i = 0; i < game.playerCnt; i++) {
        drawPlayerMain(i);
    }
}
function makeBorder(){
    ctx.lineWidth = roomSize
    ctx.strokeStyle = "white"
    ctx.strokeRect(initDrawX - ctx.lineWidth/2, initDrawY - ctx.lineWidth/2, 8 * roomSize, 8*roomSize);
}

function makeArrows(){
    for(let i=0; i<12; i++){
    rotateAndPaintImage(arrowPic,arrowPos[i][2] * Math.PI/180,arrowPos[i][0],arrowPos[i][1], -20);
    }
}

function highLightCell(cell) {
    ctx.moveTo(0, 0)
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.arc(cell.pixelsX + roomSize / 2, cell.pixelsY + roomSize / 2, roomSize / 8, 0, 2 * Math.PI, false);
    ctx.fill();
}
function dehighLightCells() {
    grid.forEach(x => x.forEach(y => y.unVisit()))
    while (game.currentHighlightedCells.length > 0) {
        let cell = game.currentHighlightedCells.pop()
        cell.unVisit();
        drawRoom(cell);
    }
}

function drawPlayerMain(i) {
    let playerCardWidth = 200;
    let playerCardHeight = 250;
    let breakOff = 6;
    let swch = false;
    let j = 0
    let x;
    let y;
    let x0;
    let y0;
    if (i == 1) {
        x  = canvas.width - playerCardWidth + 10;
        y  = 10;
        x0 = canvas.width - playerCardWidth + 10 + playerCardWidth / 3.5;
        y0 =  10 + playerCardHeight * 4 / 7;

    }
    else if (i == 3) {
        x  = canvas.width - playerCardWidth + 10;
        y  = 10 + playerCardHeight;
        x0 = canvas.width - playerCardWidth + 10 + playerCardWidth / 3.5;
        y0 =   10 + playerCardHeight + playerCardHeight * 4 / 7;
    }
    else if (i == 0) {
        x  = canvas.width - playerCardWidth - playerCardWidth;
        y  = 10;
        x0 = canvas.width - playerCardWidth - playerCardWidth + playerCardWidth / 3.5;
        y0 =  10 + playerCardHeight * 4 / 7;
    }
    else if (i == 2) {
        x  = canvas.width - playerCardWidth - playerCardWidth;
        y  = 10 + playerCardHeight;
        x0 = canvas.width - playerCardWidth - playerCardWidth + playerCardWidth / 3.5;
        y0 =   10 + playerCardHeight + playerCardHeight * 4 / 7;
    }
    if (i == game.currentPlayer && (game.moveTurn || game.playerTurn)) {
        function animatePlayer() {
            let id = setInterval(() => {
                ctx.clearRect(x, y, playerCardWidth, playerCardHeight)
                ctx.drawImage(playerCard, x, y, playerCardWidth, playerCardHeight)
                ctx.drawImage(players[i].pic, x0,y0, j + playerSize * 1.6, j + playerSize * 2)
                ctx.fillStyle = "white"
                ctx.fillText(`Treasures: ${players[i].cards.length}`,x + playerCardWidth/3, y+playerCardHeight/1.9)
                if(players[i].currentCard != null)
                    ctx.drawImage(players[i].currentCard, x + playerCardWidth/2.5, y + playerCardHeight/4, playerSize*1.2+j, playerSize*1.2+j)
                if (j < breakOff && swch) {
                    j++;
                    if (j == breakOff)
                        swch = false;
                }
                else if (j > -breakOff && !swch) {
                    j--;
                    if (j == -breakOff) {
                        swch = true
                    }
                }
                if (!game.moveTurn && !game.playerTurn)// || game.playerTurn) // || game.moveTurn && !game.playerTurn){
                    clearInterval(id)
            }, 40);
        }
        animatePlayer()
    }
    else {
        ctx.drawImage(playerCard, x, y, playerCardWidth, playerCardHeight)
        ctx.drawImage(players[i].pic, x0,y0, playerSize * 1.6, playerSize * 2)
        if(players[i].currentCard != null)
            ctx.drawImage(players[i].currentCard, x + playerCardWidth/2.5, y + playerCardHeight/4, playerSize*1.4, playerSize*1.4)
        ctx.fillStyle = "white"
        ctx.fillText(`Treasures: ${players[i].cards.length}`,x + playerCardWidth/3, y+playerCardHeight/1.9)
    }
}

function drawPlayers() {
    for (let i = 0; i < players.length; i++) {
        ctx.drawImage(players[i].pic, players[i].pixelsX, players[i].pixelsY, playerSize, playerSize);
    }
}
function drawRoom(cell, ii = 0) {
    rotateAndPaintImage(cell.type, cell.rotation * Math.PI / 180, cell.pixelsX, cell.pixelsY, 0, ii);
    if (cell.treasure != null)
        ctx.drawImage(cell.treasure, cell.pixelsX + roomSize / 4, cell.pixelsY + roomSize / 4, treasureSize, treasureSize)
    cell.players.forEach(char => {
        char.setCoords(cell.gridX, cell.gridY, cell.pixelsX, cell.pixelsY)
        ctx.drawImage(char.pic, char.pixelsX + (cell.players.indexOf(char) % 2) * roomSize / cell.players.length, (cell.players.indexOf(char) > 1 ? cell.players.indexOf(char) - 1 : 0) * roomSize / cell.players.length + char.pixelsY, playerSize * 0.8 - (cell.players.length - 1) * 2, playerSize * 1.2 - (cell.players.length - 1) * 2);
    })

}
function rotateAndPaintImage(image, angleInRad, positionX, positionY, sizeDifference = 0, i = 0) {
    if (angleInRad >= Math.PI / 2 && angleInRad < Math.PI) {
        if (i != 0) {
            axisX = i//i > roomSize ? roomSize : i;
            axisY = roomSize + sizeDifference;

        }
        else {
            axisY = roomSize + sizeDifference;
            axisX = 0;

        }
    }
    else if (angleInRad >= Math.PI && angleInRad < 3 * Math.PI / 2) {
        if (i != 0) {
            axisX = i > roomSize ? roomSize : i;
            axisY = 0;

        }
        else {
            axisX = roomSize + sizeDifference;
            axisY = roomSize + sizeDifference;
        }

    }
    else if (angleInRad >= 3 * Math.PI / 2 && 3 * Math.PI / 2 < 2 * Math.PI) {
        axisX = roomSize + sizeDifference;
        axisY = 0;
    }
    else {
        axisX = 0;
        axisY = 0;
    }
    ctx.translate(positionX, positionY);
    ctx.rotate(angleInRad);
    ctx.drawImage(image, -axisX, -axisY, roomSize + sizeDifference, roomSize + sizeDifference);
    ctx.rotate(-angleInRad);
    ctx.translate(-positionX, -positionY);
}