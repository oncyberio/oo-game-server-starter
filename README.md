## oo-game-server-starter

This is a template repo to create game servers for oo.gg games

## Getting started


- run `npm i` in the root folder of the project to insall the dependencies.

- in `partykit.json` set `name` field to change the project's name

- run `npm run dev` to test, the game server will start on `http://127.0.0.1:1999`. You can set this address in
the client script to connect to the room.



## Server Logic

### Define the Room State

The room state is defined in `src/types.ts`; The default template includes a preset for players, a game timer.

You can extend the template by adding properties to the relevent class. Every property must be annotated with
a `@type(...)`. This is needed so that the room server can efficiently serialize the state over the network.
Currently we use `@colyseus/schema` package for state definition and serialization. See [https://docs.colyseus.io/state/schema/](https://docs.colyseus.io/state/schema/)
for usage instructions.

To add player specific attributes, add the relevent properties to the `Player` class.

To add general game attributes, add the relevent properties to the `State` class.

The state is synchronized regularly for all client scripts; You can customize the rate in `src/room.ts` by setting the `tickRate` property;


** It's important to not delete the current state properties defined in this template (like `players` ...); they're used internally by the multiplayer package **



### Define the Room behavior

The room behavior is defined in `src/room.ts`. 

You can customize the room behavior by setting room properties and implementing some callback methods

```ts
export class MyRoom extends GameRoom<RoomState> {

  // Properties

  tickRate = 30
  // ...

  // Callback methods

  onPreload() { ... }

  onJoin(player) { ... }

  onMessage(message, player) { ... }

  // ...
}
```

Let's look on how to customize room class 

#### Properties

- `tickRate` : defines how often the state is synchronized with the clients

- `state` : room state

- `maxPlayers` : max number of players that can join the room

- `simulatedLatency` : in milliseconds, used to simulate network latency when using local dev server

- readonly `status` : Game loop status, can be `"idle"` or `"running"`. 



### Lifecycle methods

- `onPreload()` : is called before any client connection is made. Use this to define room initialization that needs to run only once.

- `onJoin(player)`: called when a player has beed added to the room. Use this method to initialize the player state like spawn position ...

- `onLeave(player)` : called when a player has left the room.

- `onRequestStart` : called when the room host request a game start; the default implementation. You can call the `startGame(countdown)` here to notify clients that the game will start in `countdown` seconds. 

- `onMessage(message, player)` : When a message is received from a client script. 

- `onUpdate(dt)` : called on each tick of the game loop. This is only invoked after you invoke `startGame`.

- `onDispose` : called when the room is disposed. The room is disposed when all players has left.


### Room methods:

- `broadcast (msg, except?)` : Sends a message to all players, You can exclude some in the seconds argument (player ids)

- `send (msg, playerId)` : Sends a message to a single client

- `startGame(countdown)` : Starts the game after `countdown` seconds. And notify clients, taking into account the nework latency for each player. This is usually called in the `onRequestStart` handler method. 

- `stopGame()` : Stops the game loop, and notifies all the client. Call this when the game ends by reaching the max time, or reaching a win/lose condition.




## Client Logic


### Connecting to the server Room


```ts
import { GameClient } from "@oo/scripting"

const host = "http://127.0.0.1:1999"
// or const host = your deployement url (got from npm run deploy)

class GameManager {


    async onPreload() {

        this.room = GameClient.join({ host })

        await this.room.ready

        // If you want to synchronize the players state (position, rotation, animation)
        this.playerSync = this.room.getPlayerStateSync()
    }

    onUpdate(dt: number) {

        this.playerSync.update(dt)
    }

}
```


### Sending Messages to the server

```ts
this.room.send({ type: "hit", target: "myTarget" })

```

You can then handle this message in the server room. For example:

```ts
export class MyRoom extends GameRoom<RoomState> {

  // ...

  onMessage(message, player) {

    if (message.type === "hit") {

        player.points++
    }
  }

  // ...
}
```

### Handling room events

- `room.onConnect(() => {...})` : called when the room is connected

- `room.onDisconnect(() => {...})` : called when the room is connected

- `room.onStart((countdown) => {...})` : called when the room receives a start game notification from the server

- `room.onStop(() => {...})` : called when the room receives a stop game notification from the server

- `room.onConnect(func)` : called when the room is connected

- `room.onPlayerJoined((player) => { ... })` : called when a new player joins the room

- `room.onPlayerLeft((player) => { ... })` : called when the room is connected


### Client room methods and properties

- `room.send(msg)` : sends a message to the server room

- `room.requestStart()` : sends a start game request to the server; only the room host is allowed to send a start game request

- `room.leave()` : disconnects from the server room

- readonly `room.state` : State of the room as defined in the server; the state is synchronized following the defined tick rate of the room. **Only the server can change the room state**; to initiate a change from client side, you must do through sending messages.

- readonly `room.ready` : promise that resolves when the room is connected and properly synced with the server

- readonly `room.isHost` : true is the player is the room's host

- readonly `room.roomId` : id of the room

- readonly `room.sessionId` : current player session id

- readonly `room.tickRate` : tick rate of the server room

- `room.getPlayerSync()`: returns a helper object to sync all players states (position, rotation and animation); the object sends `player-state` messages regularly to the server to notify of local player changes; and sync remote player state with the 3D scene using snapshot interpolation. 

Client side, you must call `playerSync.update(dt)` on the update loop

Server side, the default template handles the `player-state` message by updating player state on the server room. You can sync other proeprties in the `updatePlayerState() {}` method.


>Currently the player state sync is not server authoritative, so it's not well suited to fast paced contact games that involves precise collision handling. Server authoritative handling is a WIP