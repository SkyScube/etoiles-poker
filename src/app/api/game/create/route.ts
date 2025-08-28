import {NextRequest, NextResponse} from "next/server";


export async function POST(req: NextRequest) {
    const body = await req.json();
    const { NbPlayer, NbChips } = body;
    if (!NbPlayer || !NbChips) {
        return NextResponse.json({ success: false,error: 'Invalid Chip number.' },{status:400});
    }
    const url = `https://poker.test/room/4546544`;

    return NextResponse.json({ success: true, url }, { status: 200 });
}