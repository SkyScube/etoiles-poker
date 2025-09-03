import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {joinRoom} from "@/lib/GameLogic/JoinRoom";
import {ilog} from "@/lib/ilogger";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, seatNumber } = body;
        if (!roomId || !seatNumber) {
            return NextResponse.json({success: false, error: "RoomId and seatNumber needed"},{status: 400});
        }
        if (seatNumber > 6 || seatNumber < 1){
            return NextResponse.json({success: false, error: "Invalid seatNumber"});
        }
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
            return NextResponse.json({success: false, error: "Room not found"},{status: 404})
        }
        if (await joinRoom(roomId, seatNumber)) {
            await ilog.log("Seat taken",{seatNumber,roomId});
            return NextResponse.json({success: true, status: 200});
        }
    } catch (error) {
        return NextResponse.json({success: false, error: "Internal Server Error"}, {status: 400});
    }
}