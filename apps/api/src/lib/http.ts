import type { VercelRequest, VercelResponse } from '@vercel/node';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function allowMethods(req: VercelRequest, allowed: HttpMethod[]): void {
  if (!allowed.includes(req.method as HttpMethod)) {
    throw new HttpError(405, `Methode non autorisee: ${req.method}`);
  }
}

export function json(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).json(body);
}

export function csv(res: VercelResponse, filename: string, content: string): void {
  res.setHeader('content-type', 'text/csv; charset=utf-8');
  res.setHeader('content-disposition', `attachment; filename="${filename}"`);
  res.status(200).send(content);
}

export async function handle(handler: () => Promise<void>, res: VercelResponse): Promise<void> {
  try {
    await handler();
  } catch (error) {
    if (error instanceof HttpError) {
      json(res, error.status, { error: error.message, details: error.details });
      return;
    }

    const message = error instanceof Error ? error.message : 'Erreur interne';
    json(res, 500, { error: message });
  }
}

