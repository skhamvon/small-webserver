import type {
  EvaluationContext,
  JsonValue,
  Logger,
  Provider,
  ResolutionDetails,
} from "@openfeature/web-sdk";
import { StandardResolutionReasons } from "@openfeature/web-sdk";

type FlagMap = Record<string, JsonValue>;

async function loadFlags(url: string): Promise<FlagMap> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Flags: ${res.status}`);
  return (await res.json()) as FlagMap;
}

/**
 * Provider OpenFeature : charge un JSON statique dans `initialize()`,
 * puis résout de façon synchrone (contrat web SDK).
 */
export function createJsonFileProvider(flagsUrl: string): Provider {
  let flags: FlagMap = {};

  return {
    metadata: {
      name: "json-file-provider",
    },
    async initialize() {
      flags = await loadFlags(flagsUrl);
    },
    resolveBooleanEvaluation(
      flagKey: string,
      defaultValue: boolean,
      _context: EvaluationContext,
      _logger: Logger
    ): ResolutionDetails<boolean> {
      const v = flags[flagKey];
      if (typeof v === "boolean") {
        return {
          value: v,
          variant: String(v),
          reason: StandardResolutionReasons.STATIC,
        };
      }
      return {
        value: defaultValue,
        variant: String(defaultValue),
        reason: StandardResolutionReasons.DEFAULT,
      };
    },
    resolveStringEvaluation(
      flagKey: string,
      defaultValue: string,
      _context: EvaluationContext,
      _logger: Logger
    ): ResolutionDetails<string> {
      const v = flags[flagKey];
      if (typeof v === "string") {
        return {
          value: v,
          variant: v,
          reason: StandardResolutionReasons.STATIC,
        };
      }
      return {
        value: defaultValue,
        variant: defaultValue,
        reason: StandardResolutionReasons.DEFAULT,
      };
    },
    resolveNumberEvaluation(
      flagKey: string,
      defaultValue: number,
      _context: EvaluationContext,
      _logger: Logger
    ): ResolutionDetails<number> {
      const v = flags[flagKey];
      if (typeof v === "number" && Number.isFinite(v)) {
        return {
          value: v,
          variant: String(v),
          reason: StandardResolutionReasons.STATIC,
        };
      }
      return {
        value: defaultValue,
        variant: String(defaultValue),
        reason: StandardResolutionReasons.DEFAULT,
      };
    },
    resolveObjectEvaluation<T extends JsonValue>(
      flagKey: string,
      defaultValue: T,
      _context: EvaluationContext,
      _logger: Logger
    ): ResolutionDetails<T> {
      const v = flags[flagKey];
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        return {
          value: v as T,
          variant: "object",
          reason: StandardResolutionReasons.STATIC,
        };
      }
      return {
        value: defaultValue,
        variant: "default",
        reason: StandardResolutionReasons.DEFAULT,
      };
    },
  };
}
