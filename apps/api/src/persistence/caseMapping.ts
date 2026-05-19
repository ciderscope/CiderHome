type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function toSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function mapKeys(value: JsonValue, mapper: (key: string) => string): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => mapKeys(item, mapper));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [mapper(key), mapKeys(nestedValue, mapper)])
    );
  }

  return value;
}

export function camelToSnake<T>(value: T): Record<string, unknown> {
  return mapKeys(value as JsonValue, toSnakeKey) as Record<string, unknown>;
}

export function snakeToCamel<T>(value: unknown): T {
  return mapKeys(value as JsonValue, toCamelKey) as T;
}

