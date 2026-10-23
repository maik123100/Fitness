export type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string | string[];
  image_front_url?: string;
  image_front_small_url?: string;
  image_url?: string;
  categories_tags?: string[];
  serving_size?: string;
  nutriments?: Record<string, number | undefined>;
};

export type OpenFoodFactsResponse = { hits?: OpenFoodFactsProduct[] };

export type OpenFoodFactsErrorCategory =
  | 'timeout'
  | 'rate-limited'
  | 'http'
  | 'network'
  | 'invalid-response'
  | 'cancelled';

export class OpenFoodFactsError extends Error {
  constructor(
    message: string,
    readonly category: OpenFoodFactsErrorCategory,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'OpenFoodFactsError';
  }
}

const API_URL = 'https://search.openfoodfacts.org/search';
const REQUEST_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;
const SEARCH_FIELDS = [
  'code', 'product_name', 'product_name_en', 'brands', 'image_front_url',
  'image_front_small_url', 'image_url', 'categories_tags', 'serving_size', 'nutriments',
].join(',');

const isTransientStatus = (status: number) =>
  status === 429 || status === 500 || status === 502 || status === 503 || status === 504;

const wait = (milliseconds: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const finish = () => {
    signal?.removeEventListener('abort', cancel);
    resolve();
  };
  const timeout = setTimeout(finish, milliseconds);
  const cancel = () => {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
    reject(new OpenFoodFactsError('OpenFoodFacts request cancelled', 'cancelled'));
  };
  signal?.addEventListener('abort', cancel, { once: true });
});

const requestProducts = async (query: string, signal?: AbortSignal): Promise<OpenFoodFactsResponse> => {
  if (signal?.aborted) throw new OpenFoodFactsError('OpenFoodFacts request cancelled', 'cancelled');
  const url = `${API_URL}?q=${encodeURIComponent(query.trim())}&page_size=20&fields=${SEARCH_FIELDS}&langs=en`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    let timedOut = false;
    const abortFromCaller = () => controller.abort();
    signal?.addEventListener('abort', abortFromCaller, { once: true });
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'FitnessApp/1.0 (OpenFoodFacts search)',
        },
        signal: controller.signal,
      });
      if (response.ok) {
        try {
          return (await response.json()) as OpenFoodFactsResponse;
        } catch (cause) {
          throw new OpenFoodFactsError('OpenFoodFacts returned invalid JSON', 'invalid-response', undefined, { cause });
        }
      }
      if (!isTransientStatus(response.status) || attempt === MAX_RETRIES) {
        throw new OpenFoodFactsError(
          `OpenFoodFacts request failed with status ${response.status}`,
          response.status === 429 ? 'rate-limited' : 'http',
          response.status,
        );
      }
    } catch (cause) {
      if (cause instanceof OpenFoodFactsError) throw cause;
      if (signal?.aborted) throw new OpenFoodFactsError('OpenFoodFacts request cancelled', 'cancelled', undefined, { cause });
      if (timedOut && attempt === MAX_RETRIES) {
        throw new OpenFoodFactsError('OpenFoodFacts request timed out', 'timeout', undefined, { cause });
      }
      if (attempt === MAX_RETRIES) {
        throw new OpenFoodFactsError('Could not reach OpenFoodFacts', timedOut ? 'timeout' : 'network', undefined, { cause });
      }
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abortFromCaller);
    }

    await wait(500 * (attempt + 1), signal);
  }

  throw new OpenFoodFactsError('OpenFoodFacts request failed after retries', 'network');
};

export const searchOpenFoodFactsProducts = requestProducts;
