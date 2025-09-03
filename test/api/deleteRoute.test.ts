import { NextRequest } from 'next/server';

const mockPrisma = {
  room: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));
jest.mock('../../src/lib/GameLogic/DelRoom', () => ({ DelRoom: jest.fn().mockResolvedValue(true) }));
jest.mock('../../src/lib/ilogger', () => ({ ilog: { log: jest.fn() } }));

describe('api/game/delete POST', () => {
  beforeEach(() => {
    mockPrisma.room.findUnique.mockReset();
    mockPrisma.room.delete.mockReset();
  });

  it('returns success when room exists and is deleted', async () => {
    mockPrisma.room.findUnique.mockResolvedValue({ id: 'r1' });
    mockPrisma.room.delete.mockResolvedValue({ id: 'r1' });
    jest.resetModules();
    const { POST } = await import('../../src/app/api/game/delete/route');
    const req = new Request('http://localhost/api/game/delete', {
      method: 'POST',
      body: JSON.stringify({ roomId: 'r1' }),
    }) as unknown as NextRequest;
    const res = await POST(req);
    const json = await (res as any).json();
    expect(json.success).toBeTruthy();
  });

  it('returns failure when room not found', async () => {
    mockPrisma.room.findUnique.mockResolvedValue(null);
    const { POST } = await import('../../src/app/api/game/delete/route');
    const req = new Request('http://localhost/api/game/delete', {
      method: 'POST',
      body: JSON.stringify({ roomId: 'none' }),
    }) as unknown as NextRequest;
    const res = await POST(req);
    const json = await (res as any).json();
    expect(json.success).toBeFalsy();
  });
});
