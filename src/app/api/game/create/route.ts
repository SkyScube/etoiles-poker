import {NextRequest, NextResponse} from "next/server";
import {CreateRoom} from "../../../../lib/GameLogic/Create";
import {elog, ilog} from "../../../../lib/ilogger";


export async function POST(req: NextRequest) {
    try{
        const body = await req.json();
        const { NbPlayer, NbChips } = body;
        if (!NbPlayer || !NbChips) {
            return NextResponse.json({ success: false,error: 'Invalid Chip number.' },{status:400});
        }
        if (
            typeof NbPlayer !== "number" || isNaN(NbPlayer) ||
            typeof NbChips !== "number" || isNaN(NbChips)
        ) {
            return NextResponse.json(
                { success: false, error: 'NbPlayer and NbChips must be numbers' },
                { status: 400 }
            );
        }
        if (NbPlayer > 6 || NbPlayer < 1 || NbChips < 1000){
            return NextResponse.json({ success: false, error: 'Invalid Chip or Player number.' },{status:400});
        }
        const roomid:string = await CreateRoom(NbPlayer, NbChips);
        const url_app = process.env.APP_URL ?? '';
        const url:string = url_app+"/game/room/"+roomid;
        await ilog.log("Room créée", { roomid, maxPlayers: NbPlayer, startingChips: NbChips });
        return NextResponse.json({ success: true, url }, { status: 200 });
    } catch (error) {
        await elog.error("Room creation error", { error: error})
        return NextResponse.json({ success: false, error: "Internal error please refer to the administrator" },{status:500});
    }

}
