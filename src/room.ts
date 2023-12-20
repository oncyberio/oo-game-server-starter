import { GameRoom } from "@oogg/game-server";
import { State, type ClientMsg, type RoomMsg, Player, type PlayerStateMsg } from "./types";


export class MyRoom extends GameRoom<State, ClientMsg, RoomMsg> {

  tickRate = 30;

  state = new State();

  // simulatedLatency = 5000;

  static async onAuth() {
    // throw new Error("Not Authorized");
  }

  async onPreload() {
    // Server side messages
    // setInterval(() => {
    //   this.broadcast("tick");
    // }, 1000);
  }

  onRequestPrestart() {
    //
    this.notifyGamePrestart();
  }

  onRequestStart() {
    //
    this.startGame();
  }

  onJoin({ sessionId }) {
    //
    
    const player = this.state.players.get(sessionId);
    player.position.set(0, 0, 0);
  }

  onLeave({ sessionId }) {
    //
  }

  validateJoin({ sessionId }) {

    console.log("validateJoin", sessionId);

    super.validateJoin({ sessionId });

    if (this.status != "idle") {
      throw new Error("Game already started");
    }

    console.log("validateJoin", sessionId, "ok");

  }

  updatePlayerState(player: Player, message: PlayerStateMsg) {
    //
    player.position.copy(message.position);
    player.rotation.copy(message.rotation);
    player.animation = message.animation;

  }

  onMessage(message: ClientMsg, player): void {
    //
    if (message.type == "player-state") {
      
      this.updatePlayerState(player, message);
    }
  }

  async onReady() {
    // this.state.cubes = this.simulation.state.cubes;
  }

  onUpdate(dt: number) {
    // this.state.cubes = this.simulation.state.cubes;
  }
}
