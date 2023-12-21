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




### Define the Room behavior

the room behavior is defined in `src/room.ts`

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



