import type { Brand } from './Brand.types';

export type RepositoryPath = Brand<string, 'RepositoryPath'>;

export type RepositoryFilePath = Brand<string, 'RepositoryFilePath'>;

export type HunkId = Brand<string, 'HunkId'>;

export type HunkHash = Brand<string, 'HunkHash'>;

type PrimitiveErrorCode =
  'invalidRepositoryPath' | 'invalidFilePath' | 'invalidHunkId' | 'invalidHunkHash';

interface CreateStringPrimitiveOptions {
  readonly value: string;
  readonly errorCode: PrimitiveErrorCode;
}

// Creates a typed string primitive after rejecting empty values at the frontend boundary.
function createStringPrimitive<PrimitiveValue extends string>(
  options: CreateStringPrimitiveOptions,
): PrimitiveValue {
  const normalizedValue = options.value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(options.errorCode);
  }

  // The runtime empty-string guard is the brand boundary for shared primitive strings.
  return normalizedValue as PrimitiveValue;
}

export function createRepositoryPath(value: string): RepositoryPath {
  return createStringPrimitive<RepositoryPath>({
    value,
    errorCode: 'invalidRepositoryPath',
  });
}

export function createRepositoryFilePath(value: string): RepositoryFilePath {
  return createStringPrimitive<RepositoryFilePath>({
    value,
    errorCode: 'invalidFilePath',
  });
}

export function createHunkId(value: string): HunkId {
  return createStringPrimitive<HunkId>({
    value,
    errorCode: 'invalidHunkId',
  });
}

export function createHunkHash(value: string): HunkHash {
  return createStringPrimitive<HunkHash>({
    value,
    errorCode: 'invalidHunkHash',
  });
}
