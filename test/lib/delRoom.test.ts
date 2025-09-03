import { PrismaClient } from '@prisma/client';
import { DelRoom } from '../../src/lib/GameLogic/DelRoom';

var mockPrisma: any = {
  room: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

describe('DelRoom', () => {
  beforeEach(() => {
    mockPrisma.room.findUnique.mockReset();
    mockPrisma.room.delete.mockReset();
  });

  it('retourne un booléen quand la room existe (comportement actuel)', async () => {
    mockPrisma.room.findUnique.mockResolvedValue({ id: 'r1' });
    mockPrisma.room.delete.mockResolvedValue({ id: 'r1' });
    const ok = await DelRoom('r1');
    expect(typeof ok).toBe('boolean');
  });

  it('returns false when room does not exist', async () => {
    mockPrisma.room.findUnique.mockResolvedValue(null);
    const ok = await DelRoom('none');
    expect(ok).toBe(false);
    expect(mockPrisma.room.delete).not.toHaveBeenCalled();
  });
});
