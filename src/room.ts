import { GameRoom } from "@oogg/game-server"
import { RoomState } from "./types/RoomState"
import type { Player } from "./types/Player"

export class MyRoom extends GameRoom<RoomState> {
    tickRate = 10

    state = new RoomState()

    joinAfterStart = true

    maxPlayers: number = 200

    /**
     * This method is called when the room is created
     */
    async onPreload() {
        // This runs before player joins the room
    }

    /**
     * This method is called when the host request to start the game
     */
    async onRequestStart() {

        //
        await this.startGame(0)

        this.state.timer.reset()
    }

    /**
     * This method is called when a new player joins the room
     * You can set here the initial state of the player
     */
    onJoin({ sessionId }) {
        //
        // const player = this.state.players.get(sessionId)
    }

    /**
     * This method is called when a player leaves the room
     */
    onLeave({ sessionId }) {
        //

        this.state.players.delete(sessionId)
    }

    /**
     * Handle room messages sent by the client script
     */
    onMessage(message: any, player: Player): void {
      
        switch (message.type) {
            case "player-state":
                /**
                 * If you're using room.getPlayerStateSync() in the client script,
                 */

                /**
                 * Sync the player state, in case the game uses a state based sync mode
                 */
                player.position.copy(message.position)
                player.rotation.copy(message.rotation)
                player.animation = message.animation
                break
            case "broadcast":
                /**
                 * Broadcast a message to all players in the room
                 */
                const { exclude, ...data } = message

                if (exclude && !isArrayOfStrings(exclude)) {
                    console.warn("invalid exclude argument")
                    return
                }

                this.broadcast(data, exclude || [])

                break
            case "send":
                /**
                 * Send a message to a specific player
                 */
                if (message.playerId && typeof message.playerId === "string"  && this.state.players.has(message.playerId)) {
                    this.send(message, message.playerId)
                }

                break
        }
    }

    /**
     * This is called each tick of the game loop
     */
    onUpdate(dt: number) {
        // this.state.timer.step(dt)

        // if (this.state.timer.elapsedSecs > this.state.timer.maxTimeSecs) {
        //     this.stopGame()
        //     console.log("game finished")
        // }
    }
}


function isArrayOfStrings(exclude) {
    return Array.isArray(exclude) && exclude.every(element => typeof element === 'string');
}