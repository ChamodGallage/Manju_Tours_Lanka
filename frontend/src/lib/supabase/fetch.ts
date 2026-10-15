/**
 * Bounds Supabase requests so server-rendered pages can reach their existing
 * fallback content when the Supabase API is unreachable. Auth gets a longer
 * window than optional public content reads.
 */
export function createSupabaseFetch(timeoutMs: number): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    const originalSignal = init?.signal;
    const abortFromOriginal = () => controller.abort(originalSignal?.reason);

    if (originalSignal?.aborted) {
      abortFromOriginal();
    } else {
      originalSignal?.addEventListener("abort", abortFromOriginal, { once: true });
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const request = fetch(input, { ...init, signal: controller.signal });
      const deadline = new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error(`Supabase request timed out after ${timeoutMs}ms.`));
        }, timeoutMs);
      });
      return await Promise.race([request, deadline]);
    } finally {
      if (timeout) clearTimeout(timeout);
      originalSignal?.removeEventListener("abort", abortFromOriginal);
    }
  };
}

export const supabaseContentFetch = createSupabaseFetch(4_000);
export const supabaseAuthFetch = createSupabaseFetch(15_000);
