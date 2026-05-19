import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';

const ajv = new Ajv2020({ allErrors: true, strict: false });
const cache = new WeakMap<object, ValidateFunction>();

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: ErrorObject[];
}

export function validateWithSchema<T>(schema: object, data: unknown): ValidationResult<T> {
  const cached = cache.get(schema);
  const validate = cached ?? ajv.compile(schema);
  if (!cached) {
    cache.set(schema, validate);
  }

  const valid = validate(data);
  return {
    valid,
    data: valid ? (data as T) : undefined,
    errors: validate.errors ?? []
  };
}
