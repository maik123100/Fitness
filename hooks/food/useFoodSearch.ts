import { useFoodSearchSettings } from '@/hooks/useFoodSearchSettings';
import { deleteFoodSearchResult, importFoodSearchResult, searchFoods } from '@/services/food/foodSearchService';
import { openFoodFactsProvider } from '@/services/openFoodFactsService';
import type { FoodSearchResult, FoodSearchState } from '@/types/food';
import { useCallback, useEffect, useRef, useState } from 'react';

const EMPTY_RESULTS: FoodSearchResult[] = [];

export const useFoodSearch = () => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<FoodSearchState>({ status: 'idle', results: EMPTY_RESULTS });
  const { openFoodFactsSearchEnabled, setOpenFoodFactsSearch } = useFoodSearchSettings();
  const requestId = useRef(0);

  const runSearch = useCallback(async (searchQuery: string, signal?: AbortSignal) => {
    const id = ++requestId.current;
    setState((previous) => ({ status: 'loading', results: previous.results }));
    const outcome = await searchFoods(searchQuery, {
      includeRemote: openFoodFactsSearchEnabled,
      provider: openFoodFactsProvider,
      signal,
    });
    if (id !== requestId.current || outcome.status === 'cancelled') return;
    if (outcome.status === 'error') setState({ status: 'error', results: outcome.results, error: outcome.error });
    else setState({ status: outcome.status, results: outcome.results });
  }, [openFoodFactsSearchEnabled]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => { void runSearch(query, controller.signal); }, 500);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, openFoodFactsSearchEnabled, runSearch]);

  const refresh = useCallback(() => runSearch(query), [query, runSearch]);

  const importResult = useCallback((result: FoodSearchResult) => {
    const imported = importFoodSearchResult(result);
    setState((previous) => ({
      ...previous,
      results: previous.results.map((entry) => entry.food.id === imported.food.id ? imported : entry),
    }));
    return imported;
  }, []);

  const deleteResult = useCallback((result: FoodSearchResult) => {
    deleteFoodSearchResult(result);
    void refresh();
  }, [refresh]);

  return {
    query,
    setQuery,
    state,
    results: state.results,
    isSearching: state.status === 'loading' && openFoodFactsSearchEnabled && query.trim().length >= 2,
    openFoodFactsSearchEnabled,
    setOpenFoodFactsSearch,
    importResult,
    deleteResult,
    refresh,
  };
};
