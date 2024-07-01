import type * as Party from "partykit/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
};

export default class Rooms implements Party.Server {
    connections: Record<string, {
      count: number;
      maxPlayers: number;
      originalRoomId: string;
    }> | undefined;

    constructor(readonly room: Party.Room) {}
  
    async onRequest(request: Party.Request) {
      // read from storage

      this.connections =
        this.connections ?? (await this.room.storage.get("connections")) ?? {};

      if (request.method === "DELETE") {
      
        this.room.storage.delete("connections");
        this.connections = {};
        return new Response("OK");
      }
      // update connection count
      if (request.method === "POST") {

        const update: any = await request.json();

        const { 
          type,
          roomId,
          maxPlayers, 
        } = update;

        const originalRoomId = roomId.split("-").filter(chunk => !chunk.includes("room")).join("-");
        
        const count = this.connections[roomId]?.count ?? 0;
        
        if (type === "connect") {

            this.connections[roomId] = {
              count: count + 1,
              maxPlayers,
              originalRoomId
            };

        } else if (type === "disconnect") {

            this.connections[roomId] = {
              count: count - 1,
              maxPlayers,
              originalRoomId
            };

        }
        
        if (this.connections[roomId].count <= 0) {

          delete this.connections[roomId];
        
        }

        // notify any connected listeners
        this.room.broadcast(JSON.stringify(this.connections));
  
        // save to storage
        await this.room.storage.put("connections", this.connections);

        return new Response("OK");
      }

      const requestUrl = new URL(request.url);

      const _roomId = requestUrl.searchParams.get("roomId");

      if (!_roomId) {
        return new Response(JSON.stringify({
          connections: this.connections,
        }), { headers: CORS });
      }

      let roomWithAvailableSlots = Object.entries(this.connections).find(([roomId, { count, maxPlayers }]) => {
        return roomId.startsWith(_roomId) && count < maxPlayers;
      })?.[0];

      if (!roomWithAvailableSlots && !this.connections[_roomId]) {
        roomWithAvailableSlots = _roomId;
      }

      if (!roomWithAvailableSlots) {
        console.log("No room with available slots found");
        roomWithAvailableSlots = `${_roomId}-room${Date.now()}`;
      }

      // send connection counts to requester
      return new Response(JSON.stringify({
        roomWithAvailableSlots,
        connections: this.connections,
      }), { headers: CORS });
    }
}

