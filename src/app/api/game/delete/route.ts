import {NextRequest, NextResponse} from "next/server";
import {DelRoom} from "../../../../../lib/GameLogic/DelRoom";
import {PrismaClient} from "@prisma/client";
import {ilog} from "../../../../../lib/ilogger";

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
    try{
        const body = await req.json();
        const { roomId } = body;
        if (!roomId) {
            return NextResponse.json({success: false, error: "Room needed"},{status: 400});
        }
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
            return NextResponse.json({success: false, error: "Room not found"},{status: 404})
        }
        if (await DelRoom(roomId)) {
            await ilog.log("Room deleted", {roomId, maxPlayers: room.maxPlayers, startingChips: room.startingChips})
            return NextResponse.json({ success: true},{status:200});
        }
    } catch {
        return NextResponse.json({ success: false, error: "Internal error please refer to the administrator" },{status:504});
    }
}