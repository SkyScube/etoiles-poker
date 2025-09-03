import { NextRequest } from 'next/server';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    room: { findUnique: jest.fn().mockResolvedValue({ id: 'room-1' }) },
  })),
}));

jest.mock('../../src/lib/GameLogic/JoinRoom', () => ({
  joinRoom: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../src/lib/ilogger', () => ({ ilog: { log: jest.fn() } }));

describe('api/game/join POST', () => {
  it('succeeds when joinRoom returns true', async () => {
    jest.resetModules();
    const { POST } = await import('../../src/app/api/game/join/route');
    const req = new Request('http://localhost/api/game/join', {
      method: 'POST',
      body: JSON.stringify({ roomId: 'room-1', seatNumber: 2 }),
    }) as unknown as NextRequest;
    const res = await POST(req);
    const json = await (res as any).json();
    expect(json.success).toBeTruthy();
  });
});
