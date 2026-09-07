// Branding types are designed to allow TypeScript to differentiate similar types
export type Brand<BaseType, BrandName extends string> = BaseType & {
  readonly __brand: BrandName;
};
