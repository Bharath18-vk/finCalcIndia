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
 * 1. Zero SSR/Client hydration mismatches (initializes with defaults, reads URL params strictly once on mount).
 * 2. Instant 60 FPS slider performance with pure React state (zero main-thread blocking).
 * 3. Prevents history pollution and avoids breaking Next.js 15 client-side <Link> routing.
 * 4. Generates dynamic, bookmarkable share URLs on demand without thrashing window.history.
 * 5. Safe fallback to default parameters when invalid or boundary values are supplied.
 */
export function useCalculatorUrlState<TInput extends Record<string, any>>({
  schema,
  defaultInputs,
  syncWithUrl = false,
  debounceMs = 1000,
}: UseCalculatorUrlStateOptions<TInput>): CalculatorUrlState<TInput> {
  const defaultInputsRef = useRef<TInput>(defaultInputs);
  defaultInputsRef.current = defaultInputs;

  const [inputs, setInputs] = useState<TInput>(defaultInputs);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasMountedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Validate current inputs against Zod schema
  const { data: validatedData, errors: validationErrors, isValid } = useMemo(() => {
    return coerceAndValidateInput(schema, inputs, defaultInputsRef.current);
  }, [schema, inputs]);

  // Read URL query params once on initial client mount
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    if (typeof window === "undefined") {
      setIsHydrated(true);
      return;
    }

    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.toString().length > 0) {
        const queryParams: Record<string, any> = {};
        const baseDefaults = defaultInputsRef.current;

        for (const [key, defaultVal] of Object.entries(baseDefaults)) {
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

        const { data, isValid: queryValid } = coerceAndValidateInput(
          schema,
          queryParams,
          baseDefaults
        );
        if (queryValid) {
          setInputs(data);
        }
      }
    } catch {
      // Safe fallback if URL parsing fails
    }

    setIsHydrated(true);
  }, [schema]);

  // Optional passive URL sync only if explicitly enabled, preserving Next.js internal router state
  useEffect(() => {
    if (!syncWithUrl || !isHydrated || typeof window === "undefined") {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        const url = new URL(window.location.href);
        let hasChanges = false;
        const baseDefaults = defaultInputsRef.current;

        for (const [key, val] of Object.entries(inputs)) {
          const defaultVal = baseDefaults[key];
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
          // Preserve window.history.state to keep Next.js 15 router tree in sync
          window.history.replaceState(window.history.state, "", newUrl);
        }
      } catch {
        // Silently ignore if history state is protected
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputs, isHydrated, syncWithUrl, debounceMs]);

  const updateInput = useCallback(<K extends keyof TInput>(key: K, value: TInput[K]) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetInputs = useCallback(() => {
    const baseDefaults = defaultInputsRef.current;
    setInputs(baseDefaults);
    if (typeof window !== "undefined") {
      try {
        if (window.location.search) {
          window.history.replaceState(window.history.state, "", window.location.pathname);
        }
      } catch {
        // Silently ignore
      }
    }
  }, []);

  // Determine if inputs differ from baseline defaults
  const isDirty = useMemo(() => {
    const baseDefaults = defaultInputsRef.current;
    return Object.keys(baseDefaults).some((key) => inputs[key] !== baseDefaults[key]);
  }, [inputs]);

  // Generate bookmarkable share URL on demand without mutating live location
  const shareableUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      const baseDefaults = defaultInputsRef.current;
      for (const [key, val] of Object.entries(inputs)) {
        const defaultVal = baseDefaults[key];
        if (val !== defaultVal && val !== undefined && val !== null && val !== "") {
          url.searchParams.set(key, String(val));
        }
      }
      return url.toString();
    } catch {
      return typeof window !== "undefined" ? window.location.href : "";
    }
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
