import type * as Party from "partykit/server";

import { Mutex } from 'async-mutex';

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
};

const mutex = new Mutex();
    
export default class Rooms implements Party.Server {
    connections: Record<string, {
      count: number;
      maxPlayers: number;
      originalRoomId: string;
    }> | undefined;

    constructor(readonly room: Party.Room) {}
  
    async onRequest(request: Party.Request) {

      if (request.method === "DELETE") {
      
        this.room.storage.delete("connections");

        this.room.storage.delete("currentRooms");

        this.connections = {};
        
        return new Response("OK");
      }

      // update connection count
      if (request.method === "POST") {
        
        const release = await mutex.acquire();
        
        try {

          this.connections =
            this.connections ?? (await this.room.storage.get("connections")) ?? {};
    
          const update: any = await request.json();
  
          const { type, roomId, maxPlayers } = update;
          const originalRoomId = roomId.split("-").filter(chunk => !chunk.includes("room")).join("-");
          const count = this.connections[roomId]?.count ?? 0;
  
          let roomWithAvailableSlots = Object.entries(this.connections).find(
            ([_roomId, { count, maxPlayers }]) => {
              return _roomId.startsWith(originalRoomId) && count < maxPlayers;
            });
  
          if (count + 5 >= maxPlayers && !roomWithAvailableSlots) {
            
            // create new room
            const newRoomId = `${originalRoomId}-room${Date.now()}`;
  
            this.connections[newRoomId] = {
              count: 0,
              maxPlayers,
              originalRoomId
            };

          }
          
          if (type === "connect") {
            this.connections[roomId] = {
              count: count + 1,
              maxPlayers,
              originalRoomId,
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
          this.room.broadcast(JSON.stringify({
            connections: this.connections,
          }));
    
          // save to storage
          await this.room.storage.put("connections", this.connections);
  
          return new Response("OK");
        } catch(err) {
          console.log("Something went wrong", err);
        } finally {
          release();
        }
      }

      const connections =
          this.connections ?? (await this.room.storage.get("connections")) ?? {};
  
      const requestUrl = new URL(request.url);

      const roomId = requestUrl.searchParams.get("roomId");

      if (!roomId) {
        return new Response(JSON.stringify({
          connections: connections,
        }), { headers: CORS });
      }

      let roomWithAvailableSlots = Object.entries(connections).find(
        ([_roomId, { count, maxPlayers }]) => {
          return _roomId.startsWith(roomId) && count < maxPlayers;
        })?.[0];
        
      return new Response(JSON.stringify({
        connections: connections,
        roomWithAvailableSlots: roomWithAvailableSlots|| roomId,
      }), { headers: CORS });
    }
}

