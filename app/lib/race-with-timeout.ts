/** Evita unhandled rejections cuando gana el timeout en Promise.race. */
export async function raceWithTimeout<T>(
  work: Promise<T>,
  timeoutMs: number,
  onTimeout: () => T
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const fallback = onTimeout;

  const safeWork = work.catch(() => fallback());

  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => resolve(fallback()), timeoutMs);
  });

  try {
    return await Promise.race([safeWork, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
