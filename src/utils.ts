import { toHex } from "viem";
import { EffectContext } from "envio";

const toI32Bytes = (num: number): string => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setInt32(0, num, true); // little-endian
  return toHex(new Uint8Array(buffer)).slice(2); // remove '0x' prefix
};

// converts the id similar to the the graph events
export const combinedId = (
  transactionHash: string,
  logIndex: number
): string => {
  return transactionHash + toI32Bytes(logIndex);
};

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function retryOnError<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  context?: EffectContext
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoff = true, onRetry } = options;

  let lastError: Error = new Error("Unknown error");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw new Error(
          `Failed after ${maxAttempts} attempts: ${lastError.message}`
        );
      }

      onRetry?.(lastError, attempt);

      const delay = backoff ? delayMs * attempt : delayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  context?.log.error(
    `Failed after ${maxAttempts} attempts: ${lastError.message}`
  );
  throw lastError;
}
