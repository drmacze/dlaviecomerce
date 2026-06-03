export async function asyncHandler<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}
