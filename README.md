# P2P.js
Extremely simple P2P library built on PeerJS.

# Documentation

## Class P2P
Handles connections and data transfer. It is event based. 

Create a P2P instance:

```var p2p = new P2P;```

#### p2p.prototype.hostServer()
The p2p instance will act as a server that can receive connections.

#### p2p.prototype.connectToServer(id)
The p2p instance will act as a client and can connect to a server using its ID.

#### P2P.prototype.on(id, callback)
Attach a callback to an event. When the event happens, it will trigger the callback function. id is a string and callback is a function.
Example:

```
p2p.on("connection", (conn) => {
  console.log("connection!");
  //code here...
});
```

#### getting the host's ID:
```
p2p.on("id", (id) => {
  //do something with the id so you can give it to someone to connect
  alert(id);
});
```

#### P2P.prototype.emit(id, data)
Invoke an event to the other side of the connection with any string id and any data. 
Example of sending data:

Host's code:
```
p2p.emit("gameState", {...});
```

Client code:
```
p2p.on("gameState", (data) => {
  //do something with the data
});
```

## Class PeerClient
PeerClients are created when a client connects to a host. You can access the PeerClient inside of the host's connection event:

Host Code:
```
p2p.on("connection", (conn) => {
  //conn is an instance of the PeerClient and only the host has access to it!
  console.log(conn.id);
  conn.on("event", (input) => {
    //...
  }); 
  conn.on("close", (input) => {
    //the connection closed... do cleanup
  }); 
  conn.emit("text", "thanks for connecting");
});
```

#### PeerClient.prototype.id
Returns the ID of the client

#### PeerClient.prototype.emit(id, data)
Invoke an event to the other side of the connection with any string id and any data. Exactly the same as P2P.prototype.emit

