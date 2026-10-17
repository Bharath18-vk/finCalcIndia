"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { z } from "zod";
import { coerceAndValidateInput } from "@/lib/validation/validator";

export interface UseCalculatorUrlStateOptions<TInput extends Record<string, any>> {
  schema: z.ZodType<TInput>;
  defaultInputs: TInput;
  syncWithUrl?: boolean;
  debounceMs?: number;
}

export interface CalculatorUrlState<TInput> {
  inputs: TInput;
  setInputs: React.Dispatch<React.SetStateAction<TInput>>;
  updateInput: <K extends keyof TInput>(key: K, value: TInput[K]) => void;
  resetInputs: () => void;
  validationErrors: Record<string, string>;
  isValid: boolean;
  isDirty: boolean;
  isHydrated: boolean;
  shareableUrl: string;
}

/**
 * Reusable hook for synchronized calculator state with URL search parameters.
 *
 * Guarantees:
 * 1. Zero SSR/Client hydration mismatches (initializes with defaults, syncs from URL post-mount).
 * 2. Real-time validation via Zod schemas.
 * 3. Non-reloading browser URL synchronization via window.history.replaceState.
 * 4. Safe fallback to default parameters when invalid or malicious values are supplied in query string.
 */
export function useCalculatorUrlState<TInput extends Record<string, any>>({
  schema,
  defaultInputs,
  syncWithUrl = true,
  debounceMs = 400,
}: UseCalculatorUrlStateOptions<TInput>): CalculatorUrlState<TInput> {
  const [inputs, setInputs] = useState<TInput>(defaultInputs);
  const [isHydrated, setIsHydrated] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Validate the current inputs against Zod schema
  const { data: validatedData, errors: validationErrors, isValid } = useMemo(() => {
    return coerceAndValidateInput(schema, inputs, defaultInputs);
  }, [schema, inputs, defaultInputs]);

  // Read URL query params on mount (client-only)
  useEffect(() => {
    if (typeof window === "undefined" || !syncWithUrl) {
      setIsHydrated(true);
      return;
    }

    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.toString().length > 0) {
        const queryParams: Record<string, any> = {};
        for (const [key, defaultVal] of Object.entries(defaultInputs)) {
          if (searchParams.has(key)) {
            const raw = searchParams.get(key);
            if (raw !== null) {
              if (typeof defaultVal === "number") {
                const parsedNum = parseFloat(raw);
                if (!isNaN(parsedNum)) {
                  queryParams[key] = parsedNum;
                }
              } else if (typeof defaultVal === "boolean") {
                queryParams[key] = raw === "true" || raw === "1";
              } else {
                queryParams[key] = raw;
              }
            }
          }
        }

        // Validate parsed query parameters
        const { data, isValid: queryValid } = coerceAndValidateInput(schema, queryParams, defaultInputs);
        if (queryValid) {
          setInputs(data);
        }
      }
    } catch {
      // Safe fallback if URL parsing fails
    }

    setIsHydrated(true);
  }, [schema, defaultInputs, syncWithUrl]);

  // Sync state back to URL query parameters when inputs change (debounced)
  useEffect(() => {
    if (!isHydrated || !syncWithUrl || typeof window === "undefined") {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        const url = new URL(window.location.href);
        let hasChanges = false;

        for (const [key, val] of Object.entries(inputs)) {
          const defaultVal = defaultInputs[key];
          // Only push to URL if different from default
          if (val !== defaultVal && val !== undefined && val !== null && val !== "") {
            url.searchParams.set(key, String(val));
            hasChanges = true;
          } else {
            url.searchParams.delete(key);
          }
        }

        const newSearch = url.searchParams.toString();
        const currentSearch = window.location.search.replace(/^\?/, "");

        if (newSearch !== currentSearch) {
          const newUrl = newSearch ? `${url.pathname}?${newSearch}` : url.pathname;
          window.history.replaceState(window.history.state, "", newUrl);
        }
      } catch {
        // Silently fail if history.replaceState is blocked
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputs, defaultInputs, isHydrated, syncWithUrl, debounceMs]);

  const updateInput = useCallback(<K extends keyof TInput>(key: K, value: TInput[K]) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetInputs = useCallback(() => {
    setInputs(defaultInputs);
    if (typeof window !== "undefined" && syncWithUrl) {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.pathname);
    }
  }, [defaultInputs, syncWithUrl]);

  // Determine if inputs differ from baseline defaults
  const isDirty = useMemo(() => {
    return Object.keys(defaultInputs).some((key) => inputs[key] !== defaultInputs[key]);
  }, [inputs, defaultInputs]);

  // Generate shareable link
  const shareableUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, [inputs]);

  return {
    inputs: validatedData,
    setInputs,
    updateInput,
    resetInputs,
    validationErrors,
    isValid,
    isDirty,
    isHydrated,
    shareableUrl,
  };
}
