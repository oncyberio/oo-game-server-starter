import { Schema, type, MapSchema } from "@colyseus/schema";


export type XYZ = { x: number, y: number, z: number }

export class XYZState extends Schema {
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


export class GameTimer extends Schema {
    @type("number") genesisTime: number = Date.now();
    @type("number") gameStart: number = 0;
    @type("number") elapsedSecs: number = 0;
    @type("number") maxTimeSecs: number = 10;
  
    reset() {
      this.gameStart = Date.now();
      this.elapsedSecs = 0;
    }
  
    step(dt: number) {
      this.elapsedSecs += dt;
      // console.log("elapsedSecs", this.elapsedSecs);
    }
  }

