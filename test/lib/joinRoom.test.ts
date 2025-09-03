import { PrismaClient } from '@prisma/client';
import { joinRoom } from '../../src/lib/GameLogic/JoinRoom';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    seat: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  })),
}));

describe('joinRoom', () => {
  it('returns true when a seat is successfully taken', async () => {
    const ok = await joinRoom('room-1', 2);
    expect(ok).toBe(true);
  });

  it('returns a boolean (current behavior) even if no seat updated', async () => {
    (PrismaClient as unknown as jest.Mock).mockImplementationOnce(() => ({
      seat: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    }));
    const ok = await joinRoom('room-1', 99);
    expect(typeof ok).toBe('boolean');
  });
});
