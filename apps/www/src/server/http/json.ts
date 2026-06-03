import { NextResponse, type NextRequest } from 'next/server';
import { errorResponse } from '../lib/errors';

export function json(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export async function handleJson(handler: () => Promise<NextResponse> | NextResponse) {
  try {
    return await handler();
  } catch (error) {
    return errorResponse(error);
  }
}
