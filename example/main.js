const GameState = {
    players: {},
    x: 0,
    y: 0,
    p2p: null
}

class Player{
    constructor(id){
        this.id = id;
        this.x = 0;
        this.y = 0;
    }
}

function joinServer(){
    let id = prompt("server id:");

    let p2p = new P2P();
    GameState.p2p = p2p;
    p2p.connectToServer(id);

    document.addEventListener("keydown", (e) => {
        let key = e.key.toLowerCase();

        if(key == "d")
            GameState.x += 5;
        if(key == "a")
            GameState.x -= 5;
        if(key == "s")
            GameState.y += 5;
        if(key == "w")
            GameState.y -= 5;

        p2p.emit("pos", {x: GameState.x, y: GameState.y});
    });

    p2p.on("state", (data) => {
        GameState.players = data;
    });

    p2p.on("ping", (date) => {
        
        document.getElementById("ping").innerHTML = (Date.now()-date) + "ms";
    });

    setInterval(() => {
        p2p.emit("ping", Date.now());
    }, 1000);
}

function log(x){
    document.getElementById("debug").innerHTML += x + "\n";
}

function hostServer(){
    let p2p = new P2P();
    GameState.p2p = p2p;

    p2p.on("id", (id) => {
        //alert(id);
        log(id);
    });

    p2p.hostServer();

    p2p.on("connection", (conn) => {
        log("connection");
        GameState.players[conn.id] = new Player(conn.id);
        let player = GameState.players[conn.id];

        conn.on("pos", (data) => {
            player.x = data.x;
            player.y = data.y;
        });

        conn.on("close", () => {
            delete GameState.players[conn.id];
        });

        conn.on("ping", (date) => {
            conn.emit("ping", date);
        });
    });
}

//GAME LOOP
setInterval(() => {
    if(GameState.p2p == null) return;
    if(!GameState.p2p.isHost) return;

    GameState.p2p.emit("state", GameState.players);
}, 1000/40);

//RENDERING 
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
render();
function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let i in GameState.players)
        ctx.fillRect(GameState.players[i].x, GameState.players[i].y, 5, 5);

    requestAnimationFrame(render);
}
