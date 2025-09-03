import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function joinRoom(roomId:string, seatNumber:number):Promise<boolean> {
        const result = await prisma.seat.updateMany({
            where: {
                roomId,
                seatNumber,
                status: "EMPTY", // condition supplémentaire
            },
            data: {
                status: "TAKEN",
                claimedAt: new Date(),
            },
        });
        if (result.count === 0) {
            throw new Error("Seat déjà occupé ou introuvable !");
        }
        return true;
}