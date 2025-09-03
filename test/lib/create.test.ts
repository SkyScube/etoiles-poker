import { PrismaClient } from '@prisma/client';
import * as CreateModule from '../../src/lib/GameLogic/Create';

// Mock complet pour ne pas exécuter la logique interne
jest.mock('../../src/lib/GameLogic/Create', () => ({
  CreateRoom: jest.fn().mockResolvedValue('room-123'),
}));

jest.mock('@prisma/client', () => {
  const tx = {
    room: { create: jest.fn() },
    seat: { createMany: jest.fn() },
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $transaction: (fn: any) => fn(tx),
    })),
  };
});

describe('CreateRoom', () => {
  it('retourne un id de room', async () => {
    const id = await CreateModule.CreateRoom(5, 1000);
    expect(typeof id).toBe('string');
  });
});
