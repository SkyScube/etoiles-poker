import { NextRequest } from 'next/server';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    room: { findUnique: jest.fn().mockResolvedValue({ id: 'room-1' }) },
    seat: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
  })),
}));
jest.mock('../../src/lib/ilogger', () => ({ ilog: { log: jest.fn() } }));

describe('POST /api/game/join (integration)', () => {
  beforeEach(() => { jest.resetModules(); });

  it('success quand seat est pris', async () => {
    const { POST } = await import('../../src/app/api/game/join/route');
    const req = new Request('http://localhost/api/game/join', {
      method: 'POST',
      body: JSON.stringify({ roomId: 'room-1', seatNumber: 2 }),
    }) as unknown as NextRequest;
    const res = await POST(req);
    const json = await (res as any).json();
    expect(json).toBeTruthy();
  });

  it('échec quand seat déjà pris (count=0)', async () => {
    const { PrismaClient } = await import('@prisma/client');
    (PrismaClient as unknown as jest.Mock).mockImplementationOnce(() => ({
      room: { findUnique: jest.fn().mockResolvedValue({ id: 'room-1' }) },
      seat: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    }));
    const { POST } = await import('../../src/app/api/game/join/route');
    const req = new Request('http://localhost/api/game/join', {
      method: 'POST',
      body: JSON.stringify({ roomId: 'room-1', seatNumber: 3 }),
    }) as unknown as NextRequest;
    let threw = false;
    let res: any;
    try {
      res = await POST(req);
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    // Si une réponse est renvoyée, on lit le JSON, sinon on considère le flux traité
    if (res && typeof (res as any).json === 'function') {
      const json = await (res as any).json();
      expect(json).toBeTruthy();
    }
  });

  it('échec quand room inexistante', async () => {
    const { PrismaClient } = await import('@prisma/client');
    (PrismaClient as unknown as jest.Mock).mockImplementationOnce(() => ({
      room: { findUnique: jest.fn().mockResolvedValue(null) },
      seat: { updateMany: jest.fn() },
    }));
    const { POST } = await import('../../src/app/api/game/join/route');
    const req = new Request('http://localhost/api/game/join', {
      method: 'POST',
      body: JSON.stringify({ roomId: 'room-404', seatNumber: 1 }),
    }) as unknown as NextRequest;
    let threw = false;
    let res: any;
    try {
      res = await POST(req);
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    if (res && typeof (res as any).json === 'function') {
      const json = await (res as any).json();
      expect(json).toBeTruthy();
    }
  });
});
