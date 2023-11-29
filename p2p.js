class PeerClient{
    constructor(conn){
        this.conn = conn;
        this._events = {
            "close": () => {}
        }
        this.setup();
    }
    get id(){
        return this.conn.peer;
    }
    on(id, event){
        this._events[id] = event;
    }
    emit(id, data){
        let packet = JSON.stringify([id, data]);
        this.conn.send(packet);
    }
    setup(){
        this.conn.on("data", (data) => {
            let packet = JSON.parse(data);
            if(packet[0] in this._events)
                this._events[packet[0]](packet[1]);
        });
    }
}
class P2P{
    constructor(){
        this.id = null;
        this.peer = new Peer();
        this.open = false;
        this.remotePeer = null;
        this._events = {
            "_open": () => {},
            "message": (data) => {},
            "connection": () => {},
            "disconnect": () => {},
            "connect": () => {},
            "id": (id) => {},
        }
        this.peer.on('open', (id) => {
            this.id = id;
            this.open = true;
            this._events["id"](id);
            this._events["_open"](id);
        });
        this.isHost = false;
        this.client = false;

        this.clients = {

        };

        this.peer.on('connection', (conn) => { 
            if(!this.isHost) return conn.close();
            this._setupClient(conn);
        });

        this.peer.on("close", () => {
            alert("closed cuzbad");
        });
        this.peer.on("disconnected", () => {
            alert("disconnected cuzbad");
        });
    }
    _setupClient(conn){
        let client = new PeerClient(conn);

        conn.on("close", () => {
            client._events["close"]();
            delete this.clients[conn.peer];
        });

        this.clients[conn.peer] = client;
        this._events["connection"](this.clients[conn.peer]);
    }
    on(id, event){
        this._events[id] = event;
    }
    host(){
        this.isHost = true;
    }
    connect(id){
        this.client = true;
        const connection = this.peer.connect(id);
        
        this._events["connect"](connection);
        
        this.remotePeer = connection;

        this.remotePeer.on("data", (data) => {
            let packet = JSON.parse(data);
            if(packet[0] in this._events)
                this._events[packet[0]](packet[1]);
        });
    }
    emit(id, data){
        let packet = JSON.stringify([id, data]);
        if(!this.open) return;

        
        if(this.isHost){
            for(let i in this.clients){
                this.clients[i].conn.send(packet);
            }
        } else if(this.client && this.remotePeer !== null){
            this.remotePeer.send(packet);
        }
    }
    hostServer(){
        if(!this.open){
            this.on("_open", () => {
                this.host();
            });
        } else {
            this.connect(id);
        }
    }
    connectToServer(id){
        if(!this.open){
            this.on("_open", () => {
                this.connect(id);
            });
        } else {
            this.connect(id);
        }
    }
}
