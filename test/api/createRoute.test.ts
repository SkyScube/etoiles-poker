import { NextRequest } from 'next/server';
import * as CreateLogic from '../../src/lib/GameLogic/Create';

jest.mock('../../src/lib/GameLogic/Create', () => ({
  CreateRoom: jest.fn(),
}));
jest.mock('../../src/lib/ilogger', () => ({ ilog: { log: jest.fn() } }));

describe('api/game/create POST', () => {
  const origEnv = process.env.APP_URL;
  beforeEach(() => {
    process.env.APP_URL = 'https://example.com';
  });
  afterAll(() => {
    process.env.APP_URL = origEnv;
  });

  it('returns url with created room id', async () => {
    (CreateLogic.CreateRoom as jest.Mock).mockResolvedValue('abc123');
    jest.resetModules();
    const { POST } = await import('../../src/app/api/game/create/route');
    const req = new Request('http://localhost/api/game/create', {
      method: 'POST',
      body: JSON.stringify({ NbPlayer: 5, NbChips: 1000 }),
    }) as unknown as NextRequest;
    const res = await POST(req);
    const json = await (res as any).json();
    // URL attendue avec '/game/room'
    expect(typeof json.url).toBe('string');
    expect(json.url.startsWith('https://example.com')).toBe(true);
    expect(json.url).toContain('/game/room');
  });
});
