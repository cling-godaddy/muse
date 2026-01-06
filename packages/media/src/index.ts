export { createMediaClient, type MediaClientConfig } from "./client";
export type {
  ImageAttribution,
  ImageSearchResult,
  ImageSearchOptions,
  ImagePlan,
  ImageSelection,
  ImageCategory,
  MediaClient,
  MediaProvider,
} from "./types";

export { createQueryNormalizer, type QueryNormalizer, type NormalizeResult, type MediaQueryIntent } from "./normalize";
export { createGettyProvider, type GettyProviderConfig } from "./getty";
export { getIamJwt, clearIamJwtCache } from "./auth/iam";
export {
  createImageBank,
  type ImageBank,
  type BankConfig,
  type BankEntry,
  type BankSearchResult,
  type BankSearchOptions,
  type EmbedFn,
} from "./bank";
