import { Schema, type, MapSchema } from "@colyseus/schema";

export class XYZ extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  copy(other: XYZ) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
  }
}

export enum GameStatus {
    Waiting = 0,
    Playing = 1,
    Finished = 2,
}

export class Player extends Schema {
  //
  @type("string") sessionId: string = "";
  @type("string") userId: string = "";
  @type("string") name: string = "";
  @type("string") role: string = "player";
  @type(XYZ) position: XYZ = new XYZ();
  @type(XYZ) rotation: XYZ = new XYZ();
  @type("string") animation: string = "idle";
}

export class State extends Schema {
  //
  @type("string") snapshotId: string = null;
  @type("number") timestamp: number = 0;
  @type({ map: Player }) players = new MapSchema<Player>();

  addPlayer(data: any) {
    const player = new Player();
    player.sessionId = data.sessionId;
    player.userId = data.userId;
    player.name = data.name;
    player.role = data.role;
    player.position.copy(data.position);
    player.rotation.copy(data.rotation);
    player.animation = data.animation;
    
    this.players.set(data.sessionId, player);
    // console.log("added player", player.toJSON());
  }

  removePlayer(id: string) {
    this.players.delete(id);
  }
}

export type PlayerStateMsg = { type: "player-state"; position: XYZ; rotation: XYZ; animation: string }

export type DebugPhysicsMsg = { type: "debug-physics" }

export type PlayerInputMsg = { type: "player-input"; input: any, dir: number }

// Client -> Server messages
export type ClientMsg =
  | PlayerStateMsg
  | PlayerInputMsg
  | DebugPhysicsMsg

// Server -> Client messages
export type RoomMsg = never;
  