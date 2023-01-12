const start_btn = document.querySelector("#start");
const start_page = document.querySelector("#startPage");
const game_page = document.querySelector("#game");
const players_cnt = document.querySelector("#players");
const treasures_cnt = document.querySelector("#treasures");
const body = document.body
const restartBtn = document.querySelector(".restartGame")
const loadbtn = document.querySelector("#load")
const restartBtn2 = document.querySelector(".restartGame2")
const gameOver = document.getElementById("game_over")
const gameOverH2 = document.querySelector(".Power")
const saveGame = document.querySelector(".save")
const winner = document.querySelector("#winner")


start_btn.addEventListener("click", start_game);
restartBtn.addEventListener("click", restart_game);
restartBtn2.addEventListener("click", restart_game);
loadbtn.addEventListener("click", load);
function start_game() {
    start_page.style.display = "none";
    game_page.style.display = "block"
    body.classList = "not-animate"
    gameStart(parseInt(players_cnt.value), parseInt(treasures_cnt.value));
}

function restart_game(e) {
    location.reload();
}

const canvas = document.querySelector("#mycanvas")
const ctx = canvas.getContext("2d");

const roomSize = 60
const treasureSize = roomSize / 2
const playerSize = 25
const initDrawX = canvas.width / 6
const initDrawY = canvas.height / 7

let accountedForTreasures = []

let nums = Array(24).fill(null).map((_, i) => i + 1)
const cards = nums.map(x => {
    a = new Image();
    a.src = `Cards/treasure${x < 10 ? "0"+ x: x}.png`
    return a;
});

const treasures = nums.map(x => {
    a = new Image();
    a.src = `Cards/treasure${x < 10 ? "0"+ x: x}.png`
    return a;
});

const T = document.querySelector("#T");
const bend = document.querySelector("#bend");
const straight = document.querySelector("#straight");


const arrowPic = new Image();
arrowPic.src = "arrow.png";


let grid = [[], [], [], [], [], [], []];
let arrowPos;


const playerpicNums = [1,2,3,4]
const playerpics = playerpicNums.map(x => {
    a = new Image();
    a.src = `players/player${x}.png`
    return a;
}); 

const playerCard = new Image()
playerCard.src = "Cards/playerCard.png"

let gameRooms = [];
let game;
let players = [];


/////////////////////////////////////

function gameState(playerCnt = 2, treasureCnt = 1)  {
    this.slidingPiece = null;
    this.playerCnt = playerCnt;
    this.cards = treasureCnt * playerCnt;
    this.treasureCnt = treasureCnt;
    this.currentPlayer = 0;
    this.movePlayer = false;
    this.currentHighlightedCells = [];
    this.moveTurn = true;
    this.playerTurn = false;
}
function Room(type, x, y, rotation, pixelsX, pixelsY, directions = [true, true, true, true], treasure = null) {
    this.type = type;
    this.rotation = rotation;
    this.gridX = x;
    this.gridY = y;
    this.pixelsX = pixelsX;
    this.pixelsY = pixelsY;
    this.treasure = treasure;
    this.players = [];
    this.hasUp = directions[0];
    this.hasRight = directions[1];
    this.hasDown = directions[2];
    this.hasLeft = directions[3];
    this.visited = false;
    this.setRotation = function (rotation) {
        this.rotation = rotation;
    }
    this.setPixels = function (x, y) {
        this.pixelsX = x;
        this.pixelsY = y;
    }
    this.setGridPos = function (x, y) {
        this.gridX = x;
        this.gridY = y;
    }
    this.setDirections = function (directions) {
        this.directions = directions;
        this.hasUp = directions[0];
        this.hasRight = directions[1];
        this.hasDown = directions[2];
        this.hasLeft = directions[3];
    }
    this.visit = function () {
        this.visited = true;
    }
    this.unVisit = function () {
        this.visited = false;
    }
    this.setPlayers = function (cell) {
        while (cell.players.length > 0) {
            let newP = cell.players.shift();
            newP.setCoords(this.gridX, this.gridY, this.pixelsX , this.pixelsY);
            this.players.push(newP);
        }
    }
}


function Player(pic, x, y, x1, y1) {
    this.cornerX;
    this.cornerY;
    this.pic = pic;
    this.gridX = x;
    this.gridY = y;
    this.pixelsX = x1;
    this.pixelsY = y1;
    this.cards = [];
    this.treasures = [];
    this.currentCard;
    this.setCoords = function (x, y, x0, y0) {
        this.gridX = x;
        this.gridY = y;
        this.pixelsX = x0;
        this.pixelsY = y0;
    }
}
function gameStart(players_number = 2, treasureCnt) {
    game = new gameState(players_number, treasureCnt);
    createGrid()
    initTreasures();
    drawBoard();
}

function createGrid() {
    let pieces = [];
    let rotations = [90, 180, 270, 0];
    for (let i = 0; i < 6; i++) {
        pieces.push(new Room(T, 0, 0, rotations[Math.floor(Math.random() * rotations.length)], 0, 0));
    }
    for (let i = 0; i < 13; i++) {
        pieces.push(new Room(straight, 0, 0, rotations[Math.floor(Math.random() * rotations.length)], 0, 0));
    }
    for (let i = 0; i < 15; i++) {
        pieces.push(new Room(bend, 0, 0, rotations[Math.floor(Math.random() * rotations.length)], 0, 0));
    }
    pieces.sort(() => Math.random() - 0.5)
    let fixedRooms = {
        0: [bend, 0], 2: [T, 0], 4: [T, 0], 6: [bend, 90],
        8: [T, 270], 10: [T, 270], 12: [T, 0], 14: [T, 90],
        16: [T, 270], 18: [T, 180], 20: [T, 270], 22: [T, 90],
        24: [bend, 270], 26: [T, 180], 28: [T, 180], 30: [bend, 180]
    }
    let playerCnt = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (fixedRooms[j + i * 4] != null && i % 2 == 0 && j % 2 == 0) {
                let piece = new Room(fixedRooms[j + i * 4][0], i, j, fixedRooms[j + i * 4][1], initDrawX + j * roomSize, initDrawY + i * roomSize);
                findDirections(piece);
                if(piece.type == bend && playerCnt < game.playerCnt){
                    let cornerPlayer = new Player(playerpics.pop(), i,j,initDrawX + j * roomSize, initDrawY + i * roomSize);
                    cornerPlayer.cornerX = i;
                    cornerPlayer.cornerY = j;
                    piece.players.push(cornerPlayer);
                    for(let i=0; i<game.treasureCnt; i++){
                        cards.sort(()=>Math.random() - 0.5);
                        let card = cards.pop();
                        cornerPlayer.cards.push(card);
                        accountedForTreasures.push(card)
                    }
                    cornerPlayer.currentCard = cornerPlayer.cards.pop()
                    players.push(cornerPlayer)
                    playerCnt++;
                }


                grid[i].push(piece);

            }
            else {
                let piece = pieces.shift();
                piece.setGridPos(i, j);
                piece.setPixels(initDrawX + j * roomSize, initDrawY + i * roomSize);
                findDirections(piece);
                grid[i].push(piece);
                gameRooms.push(piece);
            }
        }
    }
    let diff = 10;
    arrowPos = [
    [initDrawX -      roomSize + diff, initDrawY + 1 * roomSize  + diff,0],
    [initDrawX -      roomSize + diff, initDrawY + 3 * roomSize + diff,0],
    [initDrawX -      roomSize + diff, initDrawY + 5 * roomSize + diff,0],
    [initDrawX +  1 * roomSize + diff, initDrawY + 7 * roomSize + diff,270],
    [initDrawX +  3 * roomSize + diff, initDrawY + 7 * roomSize + diff,270],
    [initDrawX +  5 * roomSize + diff, initDrawY + 7 * roomSize + diff,270],
    [initDrawX +  7 * roomSize + diff, initDrawY + 1 * roomSize + diff,180],
    [initDrawX +  7 * roomSize + diff, initDrawY + 3 * roomSize + diff,180],
    [initDrawX +  7 * roomSize + diff, initDrawY + 5 * roomSize + diff,180],
    [initDrawX +  1 * roomSize + diff, initDrawY -     roomSize + diff,90],
    [initDrawX +  3 * roomSize + diff, initDrawY -     roomSize + diff,90],
    [initDrawX +  5 * roomSize + diff, initDrawY -     roomSize + diff,90]]

    makeSlidingPiece(pieces.pop());
}

function initTreasures() {
    for(let i =0; i<game.cards; i++){
        gameRooms.sort(()=>Math.random() - 0.5);
        let insert = false;
        while(!insert){
            accountedForTreasures.forEach(x =>{
                if (x.src == treasures[treasures.length-1].src){
                    insert = true

                }
                else if (!insert){
                    treasures.sort(()=>Math.random() - 0.5);
                }
            })
        }
        if(insert){
            let room = gameRooms.pop()
            let treasure = treasures.pop()
            room.treasure = treasure;
        }
    }
}
function makeSlidingPiece(room){
    room.setPixels(grid[0][6].pixelsX + roomSize,grid[0][6].pixelsY - roomSize);
    findDirections(room);
    game.slidingPiece = room;
}
function rotate(arr) {
    let last = arr.pop();
    arr.unshift(last);
}
function findDirections(room) {
    let ts = [false, true, true, true]
    let bends = [false, true, true, false]
    let straights = [false, true, false, true]
    if (room.type == T) {
        for (let i = 0; i < room.rotation; i += 90) {
            rotate(ts);
        }
        room.setDirections(ts);
    }
    else if (room.type == bend) {
        for (let i = 0; i < room.rotation; i += 90) {
            rotate(bends);
        }
        room.setDirections(bends);
    }
    else {
        for (let i = 0; i < room.rotation; i += 90) {
            rotate(straights);
        }
        room.setDirections(straights);
    }
}
function rotateGamePiece() {
    let i =0;
    let x = game.slidingPiece.rotation;
    // let id = setInterval(() => {
    //     drawBoard()
    //     game.slidingPiece.rotation = x + i
    //     drawRoom(game.slidingPiece,i);
    //     i++;
    //     if( i == 90){
    //         game.slidingPiece.rotation = ( x + i) % 360
    //         clearInterval(id);
    //     }
    // }, 0);
    game.slidingPiece.rotation = (x + 90) % 360
    findDirections(game.slidingPiece); 
    drawRoom(game.slidingPiece);
}
function graphTraversal(cell) {
    let x = cell.gridX;
    let y = cell.gridY;
    grid[x][y].visit();
    let neighbours = [[0, -1, 4], [1, 0, 3], [0, 1, 2], [-1, 0, 1]];
    neighbours.forEach(neighbour => {
        let neighX = x + neighbour[0];
        let neighY = y + neighbour[1];
        if (neighX < 7 && neighX >= 0 && neighY < 7 && neighY >= 0 && !grid[neighX][neighY].visited) {
            if ((cell.hasRight && grid[neighX][neighY].hasLeft && neighbour[2] == 2) ||
                (cell.hasLeft && grid[neighX][neighY].hasRight && neighbour[2] == 4) ||
                (cell.hasDown && grid[neighX][neighY].hasUp && neighbour[2] == 3) ||
                (cell.hasUp && grid[neighX][neighY].hasDown && neighbour[2] == 1)) {
                highLightCell(grid[neighX][neighY]);
                game.currentHighlightedCells.push(grid[neighX][neighY]);
                graphTraversal(grid[neighX][neighY]);
            }
        }
    })
}
async function moveGrid(x,y) {
    return new Promise((resolve,_) =>{
    if(x ==0){
        async function move(){
            let a = new Room(game.slidingPiece.type, y,0, game.slidingPiece.rotation,
                grid[y][0].pixelsX, grid[y][0].pixelsY, game.slidingPiece.directions,game.slidingPiece.treausre);
                a = Object.assign(a, game.slidingPiece);
                a.setPixels(grid[y][0].pixelsX, grid[y][0].pixelsY);
                a.setGridPos(grid[y][0].gridX, grid[y][0].gridY);
                a.setPlayers(grid[y][6])
                for (let j = 0; j < 7; j++) {
                let i =0;
                let x0 = grid[y][j].pixelsX;
                let y0 = grid[y][j].pixelsY;
                
                let intervalId = setInterval(() => {
                    grid[y][j].setPixels(x0+ i,y0);
                    drawBoard();  
                    i++;
                    if(i > roomSize){
                        grid[y][j].setGridPos(y,j+1);
                        clearInterval(intervalId);
                    }
                }, 0);
            }
            await movePiece(grid[y][0].pixelsX,grid[y][0].pixelsY);    
            game.slidingPiece = grid[y].pop()
            grid[y].unshift(a);
            resolve();
        }
        move();
    }
    else if(x == 7){
        async function move(){
            let a = new Room(game.slidingPiece.type, y,6, game.slidingPiece.rotation,
                grid[y][6].pixelsX, grid[y][6].pixelsY, game.slidingPiece.directions,game.slidingPiece.treausre);
                a = Object.assign(a, game.slidingPiece);
                a.setPixels(grid[y][6].pixelsX, grid[y][6].pixelsY);
                a.setGridPos(grid[y][6].gridX, grid[y][6].gridY);
                a.setPlayers(grid[y][0])
                for (let j = 6; j > -1; j--) {
                let i =0;
                let x0 = grid[y][j].pixelsX;
                let y0 = grid[y][j].pixelsY;
                
                let intervalId = setInterval(() => {
                    grid[y][j].setPixels(x0- i,y0);
                    drawBoard();  
                    i++;
                    if(i > roomSize){
                        grid[y][j].setGridPos(y,j-1);
                        clearInterval(intervalId);
                    }
                }, 0);
            }
            await movePiece(grid[y][6].pixelsX,grid[y][6].pixelsY);    
            game.slidingPiece = grid[y].shift()
            grid[y].push(a);
            resolve();
        }
        move();   
    }
    else if(y == 0){
        async function move(){
            let a = new Room(game.slidingPiece.type,0,x, game.slidingPiece.rotation,
                grid[0][x].pixelsX, grid[0][x].pixelsY, game.slidingPiece.directions,game.slidingPiece.treausre);
                a = Object.assign(a, game.slidingPiece);
                a.setPixels(grid[0][x].pixelsX, grid[0][x].pixelsY);
                a.setGridPos(grid[0][x].gridX, grid[0][x].gridY);
                a.setPlayers(grid[6][x])
                for (let j = 0; j < 7; j++) {
                let i =0;
                let x0 = grid[j][x].pixelsX;
                let y0 = grid[j][x].pixelsY;
                
                let intervalId = setInterval(() => {
                    grid[j][x].setPixels(x0,y0 + i);
                    grid[j][x].setGridPos(j+1,x);
                    drawBoard();  
                    i++;
                    if(i > roomSize){
                        clearInterval(intervalId);
                    }
                }, 0);
            }
            await movePiece(grid[0][x].pixelsX,grid[0][x].pixelsY);
            let newColumn = []
            for(let j = 0; j < 7; j++){
                newColumn.push(grid[j].splice(x,1)[0])
            }
            game.slidingPiece = newColumn.pop()
            newColumn.unshift(a);
            for(let j = 0; j < 7; j++){
                grid[j].splice(x,0,newColumn.shift());
            }
            resolve();
        }
        move();   
    }
    else if(y == 7){
        async function move(){
            let a = new Room(game.slidingPiece.type,6,x, game.slidingPiece.rotation,
                grid[6][x].pixelsX, grid[6][x].pixelsY, game.slidingPiece.directions,game.slidingPiece.treausre);
                a = Object.assign(a, game.slidingPiece);
                a.setPixels(grid[6][x].pixelsX, grid[6][x].pixelsY);
                a.setGridPos(grid[6][x].gridX, grid[6][x].gridY);
                a.setPlayers(grid[0][x])
                for (let j = 0; j < 7; j++) {
                let i =0;
                let x0 = grid[j][x].pixelsX;
                let y0 = grid[j][x].pixelsY;
                
                let intervalId = setInterval(() => {
                    grid[j][x].setPixels(x0,y0 - i);
                    grid[j][x].setGridPos(j-1,x);
                    drawBoard();  
                    i++;
                    if(i > roomSize){
                        clearInterval(intervalId);
                    }
                }, 0);
            }
            await movePiece(grid[6][x].pixelsX,grid[6][x].pixelsY);
            let newColumn = []
            for(let j = 6; j  >= 0; j--){
                newColumn.push(grid[j].splice(x,1)[0])
            }
            game.slidingPiece = newColumn.pop()
            newColumn.unshift(a);
            for(let j = 0; j < 7; j++){
                grid[j].splice(x,0,newColumn.pop());
            }
            resolve();
        }
        move();
    }
})
}

async function movePiece(x,y,player=false,roomToX=0,roomToY=0){
    return new Promise((resolve,reject)=>{
    let x0;
    let y0;
    let ourPlayer =players[game.currentPlayer] 
    if(player){
        let index = grid[ourPlayer.gridX][ourPlayer.gridY].players.indexOf(ourPlayer)
        grid[ourPlayer.gridX][ourPlayer.gridY].players.splice(index,1);
        x0 = ourPlayer.pixelsX
        y0 = ourPlayer.pixelsY
    }
    else{
        x0 = game.slidingPiece.pixelsX
        y0 = game.slidingPiece.pixelsY
    }
    let i  = 0;
    let j  = 0;
    let id = setInterval(() => {
        drawBoard();
        if(player){
            ctx.drawImage(ourPlayer.pic,x0 + i,y0 +j, playerSize*0.8, playerSize*1.2);
        }
        else{
            game.slidingPiece.setPixels(x0 + i, y0 + j)
            drawRoom(game.slidingPiece);
        }

        if (Math.floor(x) - Math.floor(x0 + i) > 0)
            i++;
        if (Math.floor(x) - Math.floor(x0 + i) < 0)
            i--;
        if (Math.floor(y) - Math.floor(y0 + j) > 0)
            j++;
        if (Math.floor(y) - Math.floor(y0 + j) < 0)
            j--;
        if (Math.floor(x) - Math.floor(x0 + i) == 0 && Math.floor(y) - Math.floor(y0 + j) == 0){
            if(player){
                ourPlayer.setCoords(roomToY,roomToX,x,y);
                grid[roomToY][roomToX].players.push(ourPlayer);
                drawBoard();
            }
            clearInterval(id);
            resolve();
        }
    }, 0);
    });

}
///////
saveGame.addEventListener("click", save);

function save(){
    localStorage.setItem("game",JSON.stringify(game) )
    localStorage.setItem("rooms",JSON.stringify(gameRooms) )
    localStorage.setItem("players",JSON.stringify(players) )
    localStorage.setItem("grid",JSON.stringify(grid) )
    console.log(grid)
    localStorage.setItem("arrowPos",JSON.stringify(arrowPos) )
    localStorage.setItem("accountedForTreasures",JSON.stringify(accountedForTreasures) )
}

function load(){
    if(localStorage.length >0){
    game = JSON.parse( localStorage.getItem("game"));
    players = JSON.parse(localStorage.getItem("players"))
    gameRooms = JSON.parse(localStorage.getItem("rooms"))
    grid = JSON.parse(localStorage.getItem("grid"))
    console.log(grid)
    arrowPos = JSON.parse(localStorage.getItem("arrowPos"))
    accountedForTreasures = JSON.parse(localStorage.getItem("accountedForTreasures"))

    start_page.style.display = "none";
    game_page.style.display = "block"
    body.classList = "not-animate"
    //createGrid()
    //initTreasures();
    drawBoard();
}
}
////////////////////////////////////////
canvas.addEventListener('click', function (event) {
    var bounds = event.target.getBoundingClientRect();
    var x = event.clientX - bounds.left;
    var y = event.clientY - bounds.top;
    let newX = Math.floor((x - initDrawX + roomSize) / roomSize);
    let newY = Math.floor((y - initDrawY + roomSize) / roomSize);
    if (x >= game.slidingPiece.pixelsX && y >= game.slidingPiece.pixelsY
        && x <= game.slidingPiece.pixelsX + roomSize && y <= game.slidingPiece.pixelsY + roomSize
       ) {
           event.preventDefault()
    }
    else if((newX == 0 && newY == 2 || newX == 0 && newY == 4 || newX == 0 && newY == 6 ||
        newX == 2     && newY == 0 || newX == 4 && newY == 0 || newX == 6 && newY == 0 ||
        newX == 8 && newY == 2 || newX == 8 && newY == 4 || newX == 8 && newY == 6 ||
       newX == 2 && newY == 8 || newX == 4 && newY == 8 || newX == 6 && newY == 8)
       && game.moveTurn 
       ){
        async function doesMoving(){
            game.moveTurn = false;
            await moveGrid(newX > 0? newX-1:newX,newY > 0? newY-1:newY);
            game.playerTurn = true;
            ///
            drawBoard();
            ///
            graphTraversal(grid[players[game.currentPlayer].gridX][players[game.currentPlayer].gridY])
            if(game.currentHighlightedCells.length == 0 ){
                game.playerTurn = false;
                drawBoard();
                game.currentPlayer = (game.currentPlayer + 1) % game.playerCnt ;
                game.moveTurn = true;
                drawBoard();
                dehighLightCells();
            }
        }
        doesMoving()
    }
    else if (x >= grid[0][0].pixelsX && x <= grid[6][6].pixelsX + roomSize
        && y >= grid[0][0].pixelsY && y <= grid[6][6].pixelsY + roomSize
        && game.playerTurn && grid[Math.floor((y - initDrawY) / roomSize)][Math.floor((x - initDrawX) / roomSize)].visited
        ) {
        game.playerTurn = false;
        async function moving(){
            newX = Math.floor((x - initDrawX) / roomSize);
            newY = Math.floor((y - initDrawY) / roomSize);
            await movePiece(grid[newY][newX].pixelsX,grid[newY][newX].pixelsY
                ,true,newX,newY);
            game.currentPlayer = (game.currentPlayer + 1) % game.playerCnt  ;
            game.moveTurn = true;
            drawBoard();
        }
        drawBoard();
        moving();
        dehighLightCells();
        if( grid[newY][newX].treasure != null){
            let movedPlayer = players[game.currentPlayer]
            if(movedPlayer.currentCard.src == grid[newY][newX].treasure.src){
                if(movedPlayer.cards.length >0){
                    movedPlayer.currentCard = movedPlayer.cards.pop() 
                }
                else{
                    movedPlayer.currentCard = null;
                }
                grid[newY][newX].treasure = null;
            }
        }
        if(players[game.currentPlayer].cornerX == newY && players[game.currentPlayer].cornerY == newX && players[game.currentPlayer].currentCard == null ){
            gameOver.style.display = "block";
            game_page.style.display = "none"
            gameOverH2.innerHTML = `Player ${game.currentPlayer+1}\ has won!`;
            winner.src = `players/player${game.currentPlayer+1==1?4:game.currentPlayer+1==2?3:game.currentPlayer+1==3?2:1}.png`
            winner.removeAttribute("hidden");
            
        }
        drawBoard();
    }

}, false);


canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    var bounds = event.target.getBoundingClientRect();
    var x = event.clientX - bounds.left;
    var y = event.clientY - bounds.top;
    if (x >= game.slidingPiece.pixelsX && y >= game.slidingPiece.pixelsY
        && x <= game.slidingPiece.pixelsX + roomSize && y <= game.slidingPiece.pixelsY + roomSize) {
        rotateGamePiece();
    }
});
//////////////////