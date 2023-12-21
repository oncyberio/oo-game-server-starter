import { Schema, type, MapSchema } from "@colyseus/schema";
import { XYZState } from "./utils";


export class Player extends Schema {
  //
  @type("string") sessionId: string = "";
  @type("string") userId: string = "";
  @type("string") name: string = "";
  @type("string") role: string = "player";
  @type("number") latency: number = 0;
  @type(XYZState) position: XYZState = new XYZState();
  @type(XYZState) rotation: XYZState = new XYZState();
  @type("string") animation: string = "idle";

}