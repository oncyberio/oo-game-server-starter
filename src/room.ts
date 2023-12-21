import { GameRoom } from "@oogg/game-server";
import { State, type ClientMsg, type RoomMsg, Player, type PlayerStateMsg } from "./types";


export class MyRoom extends GameRoom<State, ClientMsg, RoomMsg> {


  tickRate = 30;

  state = new State();

  simulatedLatency = 100;

  static async onAuth() {
    // throw new Error("Not Authorized");
  }

  async onPreload() {
    // Server side messages
    // setInterval(() => {
    //   this.broadcast("tick");
    // }, 1000);

  }

  async onRequestStart() {
    //
    // console.log("onRequestStart");
    await this.startGame(3);
    console.log("game started");
    this.state.timer.reset(); 
  }

  onJoin({ sessionId }) {
    //
    const player = this.state.players.get(sessionId);

    const x = Math.random() * 10 - 5;
    const z = Math.random() * 10 - 5;
    player.position.set(x, 0, z);
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

    this.state.timer.step(dt);

    if (this.state.timer.elapsedSecs > this.state.timer.maxTimeSecs) {
      this.stopGame();
      console.log("game finished");
    }
    
  }
}
