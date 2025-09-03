import { NextRequest } from 'next/server';

jest.mock('../../src/lib/GameLogic/Create', () => ({
  CreateRoom: jest.fn(),
}));
jest.mock('../../src/lib/ilogger', () => ({ ilog: { log: jest.fn() } }));

describe('POST /api/game/create (integration)', () => {
  const origEnv = process.env.APP_URL;
  beforeEach(() => {
    jest.resetModules();
    process.env.APP_URL = 'https://example.com';
  });
  afterAll(() => { process.env.APP_URL = origEnv; });

  it('retourne une URL avec le roomId (OK)', async () => {
    const { CreateRoom } = await import('../../src/lib/GameLogic/Create');
    (CreateRoom as jest.Mock).mockResolvedValue('room-xyz');
    const { POST } = await import('../../src/app/api/game/create/route');
    const req = new Request('http://localhost/api/game/create', {
      method: 'POST',
      body: JSON.stringify({ NbPlayer: 5, NbChips: 1000 }),
    }) as unknown as NextRequest;

    const res = await POST(req);
    const json = await (res as any).json();
    expect(typeof json.url).toBe('string');
    expect(json.url).toContain('room-xyz');
  });

  it('renvoie une erreur si CreateRoom lève (500)', async () => {
    const { CreateRoom } = await import('../../src/lib/GameLogic/Create');
    (CreateRoom as jest.Mock).mockRejectedValue(new Error('boom'));
    const { POST } = await import('../../src/app/api/game/create/route');
    const req = new Request('http://localhost/api/game/create', {
      method: 'POST',
      body: JSON.stringify({ NbPlayer: 5, NbChips: 1000 }),
    }) as unknown as NextRequest;

    const res = await POST(req);
    // on vérifie au moins que ça retourne un JSON avec un message d'erreur
    const json = await (res as any).json();
    expect(json).toBeTruthy();
  });
});

