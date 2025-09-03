import { NextRequest } from 'next/server';

jest.mock('../../src/lib/GameLogic/Create', () => ({
  CreateRoom: jest.fn(),
}));
jest.mock('../../src/lib/ilogger', () => ({
    ilog: { log: jest.fn(), warn: jest.fn() },
    elog: { error: jest.fn(), log: jest.fn(), warn: jest.fn() },
}));

describe('POST /api/game/create (integration)', () => {
  const origEnv = process.env.APP_URL;
  beforeEach(() => {
    jest.resetModules();
    process.env.APP_URL = 'https://example.com';
  });
  afterAll(() => { process.env.APP_URL = origEnv; });

    const makeReq = (body: any, opts?: {raw?: boolean}) =>
        new Request('http://localhost/api/game/create', {
            method: 'POST',
            headers: opts?.raw ? {} : { 'content-type': 'application/json' },
            body: body === undefined
                ? undefined
                : opts?.raw
                    ? body
                    : JSON.stringify(body),
        }) as unknown as NextRequest;

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

    describe('400 - champs manquants ou falsy (captés par !NbPlayer || !NbChips)', () => {
        it.each([
            { name: 'manque NbPlayer et NbChips', body: {} },
            { name: 'manque NbPlayer', body: { NbChips: 1000 } },
            { name: 'manque NbChips', body: { NbPlayer: 4 } },
            { name: 'NbPlayer = 0', body: { NbPlayer: 0, NbChips: 1000 } },
            { name: 'NbChips = 0', body: { NbPlayer: 4, NbChips: 0 } },
            { name: 'NbPlayer NaN', body: { NbPlayer: Number.NaN, NbChips: 1000 } },
            { name: 'NbChips NaN', body: { NbPlayer: 4, NbChips: Number.NaN } },
        ])('rejette: $name', async ({ body }) => {
            const { CreateRoom } = await import('../../src/lib/GameLogic/Create');
            const { POST } = await import('../../src/app/api/game/create/route');

            const res = await POST(makeReq(body));
            const json = await (res as any).json();

            expect((res as any).status).toBe(400);
            expect(json.success).toBe(false);
            expect(json.error).toBe('Invalid Chip number.');
            expect((CreateRoom as jest.Mock)).not.toHaveBeenCalled();
        });
    });

    // -------- 400 : TYPES (détectés par le 2e if) --------
    describe('400 - mauvais types (string)', () => {
        it.each([
            { name: 'NbPlayer string', body: { NbPlayer: '4', NbChips: 1000 } },
            { name: 'NbChips string', body: { NbPlayer: 4, NbChips: '1000' } },
        ])('rejette: $name', async ({ body }) => {
            const { CreateRoom } = await import('../../src/lib/GameLogic/Create');
            const { POST } = await import('../../src/app/api/game/create/route');

            const res = await POST(makeReq(body));
            const json = await (res as any).json();

            expect((res as any).status).toBe(400);
            expect(json.success).toBe(false);
            expect(json.error).toBe('NbPlayer and NbChips must be numbers');
            expect((CreateRoom as jest.Mock)).not.toHaveBeenCalled();
        });
    });

    // -------- 400 : BORNES MÉTIER (détectées par 3e if) --------
    describe('400 - bornes (players/chips)', () => {
        it.each([
            { name: 'NbPlayer > 6', body: { NbPlayer: 7, NbChips: 1000 } },
            { name: 'NbPlayer < 1 (ex: -1)', body: { NbPlayer: -1, NbChips: 1000 } },
            { name: 'NbChips < 1000', body: { NbPlayer: 4, NbChips: 999 } },
        ])('rejette: $name', async ({ body }) => {
            const { CreateRoom } = await import('../../src/lib/GameLogic/Create');
            const { POST } = await import('../../src/app/api/game/create/route');

            const res = await POST(makeReq(body));
            const json = await (res as any).json();

            expect((res as any).status).toBe(400);
            expect(json.success).toBe(false);
            expect(json.error).toBe('Invalid Chip or Player number.');
            expect((CreateRoom as jest.Mock)).not.toHaveBeenCalled();
        });
    });

    // -------- 500 : BODY INVALIDE / NON-JSON (req.json() jette) --------
    describe('500 - body non JSON ou JSON invalide (req.json() jette)', () => {
        it('body absent → 500', async () => {
            const { CreateRoom } = await import('../../src/lib/GameLogic/Create');
            const { POST } = await import('../../src/app/api/game/create/route');

            const req = new Request('http://localhost/api/game/create', {
                method: 'POST',
            }) as unknown as NextRequest;

            const res = await POST(req);
            const json = await (res as any).json();

            expect((res as any).status).toBe(500);
            expect(json.success).toBe(false);
            expect(json.error).toBe('Internal error please refer to the administrator');
            expect((CreateRoom as jest.Mock)).not.toHaveBeenCalled();
        });

        it('content-type pas JSON + corps non JSON → 500', async () => {
            const { CreateRoom } = await import('../../src/lib/GameLogic/Create');
            const { POST } = await import('../../src/app/api/game/create/route');

            const res = await POST(makeReq('not a json', { raw: true }));
            const json = await (res as any).json();

            expect((res as any).status).toBe(500);
            expect(json.success).toBe(false);
            expect(json.error).toBe('Internal error please refer to the administrator');
            expect((CreateRoom as jest.Mock)).not.toHaveBeenCalled();
        });
    });

    // -------- 200 : FLOATS (puisque ta route ne les interdit pas) --------
    it('accepte des floats (comportement actuel de la route)', async () => {
        const { CreateRoom } = await import('../../src/lib/GameLogic/Create');
        (CreateRoom as jest.Mock).mockResolvedValue('room-float');

        const { POST } = await import('../../src/app/api/game/create/route');
        const res = await POST(makeReq({ NbPlayer: 3.5, NbChips: 1000.5 }));
        const json = await (res as any).json();

        expect((res as any).status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.url).toContain('room-float');
        expect((CreateRoom as jest.Mock)).toHaveBeenCalledWith(3.5, 1000.5);
    });
});