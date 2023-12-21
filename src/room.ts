import { GameRoom } from "@oogg/game-server";
import { RoomState } from "./types/RoomState";
import type { Player } from "./types/Player";


export class MyRoom extends GameRoom<RoomState> {

  tickRate = 30;

  state = new RoomState();

  simulatedLatency = 100;

  
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
    await this.startGame(3);
    console.log("game started");
    this.state.timer.reset(); 
  }

  /**
   * This method is called when a new player joins the room
   * You can set here the initial state of the player
   */
  onJoin({ sessionId }) {
    //
    const player = this.state.players.get(sessionId);

    const x = Math.random() * 10 - 5;
    const z = Math.random() * 10 - 5;
    player.position.set(x, 0, z);
  }


  /**
   * This method is called when a player leaves the room
   */
  onLeave({ sessionId }) {
    //
  }

  /**
   * Sync the player state, in case the game uses a state based sync mode
   */
  updatePlayerState(player: Player, message: any) {
    //
    player.position.copy(message.position);
    player.rotation.copy(message.rotation);
    player.animation = message.animation;

  }

  /**
   * Handle room messages sent by the client script
   */
  onMessage(message: any, player: Player): void {
    /**
     * If you're using room.getPlayerStateSync() in the client script, 
     */
    if (message.type == "player-state") {
      
      this.updatePlayerState(player, message);
    }
  }

  /**
   * This is called each tick of the game loop
   */
  onUpdate(dt: number) {

    this.state.timer.step(dt);

    if (this.state.timer.elapsedSecs > this.state.timer.maxTimeSecs) {
      this.stopGame();
      console.log("game finished");
    }
    
  }
}
