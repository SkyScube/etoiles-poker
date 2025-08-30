import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


export async function CreateRoom(NbPlayer:number, NbChips:number): Promise<string> {
    const roomId = await prisma.$transaction(async (tx) => {
        const room = await tx.room.create({
            data: {
                status: "LOBBY",
                maxPlayers: NbPlayer,
                startingChips: NbChips,
            },
            select: { id: true },
        });

        const seatsData = Array.from({ length: NbPlayer }, (_, i) => ({
            roomId: room.id,
            seatNumber: i+1,
            initialStack: NbChips,
            currentStack: NbChips,
            status: "EMPTY",
            claimedAt: null as Date | null,
        }));

        await tx.seat.createMany({ data: seatsData });

        return room.id;
    });

    return roomId;
}