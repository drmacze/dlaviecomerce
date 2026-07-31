import { readCommerceSession, writeCommerceSession } from '../../../../src/commerce/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const state = await readCommerceSession();
  if (!state.cart) {
    return Response.json({ data: null }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (new Date(state.cart.expiresAt).getTime() <= Date.now()) {
    const { cart: _cart, checkout: _checkout, ...rest } = state;
    await writeCommerceSession(rest);
    return Response.json({ data: null }, { headers: { 'Cache-Control': 'no-store' } });
  }

  return Response.json(
    { data: { id: state.cart.id, expiresAt: state.cart.expiresAt } },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function DELETE(): Promise<Response> {
  const state = await readCommerceSession();
  const { cart: _cart, checkout: _checkout, ...rest } = state;
  await writeCommerceSession(rest);
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
