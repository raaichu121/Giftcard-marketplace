"use client";

import * as React from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type AsyncAction<T> =
  | { type: "pending" }
  | { type: "success"; payload: T }
  | { type: "error"; payload: Error };

/**
 * Hook to manage async operations (API calls, etc.)
 * Reduces boilerplate for loading/error states
 * @param asyncFunction Function that returns a Promise
 * @param immediate If true, executes immediately on mount
 * @returns {Object} { data, loading, error, execute }
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true,
) {
  const [state, dispatch] = React.useReducer(
    (state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> => {
      switch (action.type) {
        case "pending":
          return { ...state, loading: true, error: null };
        case "success":
          return {
            ...state,
            data: action.payload,
            loading: false,
            error: null,
          };
        case "error":
          return { ...state, error: action.payload, loading: false };
        default:
          return state;
      }
    },
    { data: null, loading: immediate, error: null },
  );

  const execute = React.useCallback(async () => {
    dispatch({ type: "pending" });
    try {
      const response = await asyncFunction();
      dispatch({ type: "success", payload: response });
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      dispatch({ type: "error", payload: err });
      throw err;
    }
  }, [asyncFunction]);

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}