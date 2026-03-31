import { OpenFeature } from "@openfeature/web-sdk";

/** Lecture synchrone des drapeaux (provider déjà initialisé au bootstrap). */
export function useBooleanFlag(key: string, defaultValue: boolean): boolean {
  return OpenFeature.getClient().getBooleanValue(key, defaultValue);
}
