import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';

interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

interface UsePaginationOptions {
  endpoint: string;
  limit?: number;
}

interface UsePaginationReturn<T> {
  data: T[];
  meta: PaginationMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadMore: () => void;
  refresh: () => void;
  hasMore: boolean;
}

export function usePagination<T = any>({ endpoint, limit = 10 }: UsePaginationOptions): UsePaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const fetchPage = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiClient.get(endpoint, {
        params: { page: pageNum, limit },
      });

      const resData = response.data;

      // Handle both paginated { data, meta } and plain array responses
      if (resData?.data && resData?.meta) {
        if (isRefresh || pageNum === 1) {
          setData(resData.data);
        } else {
          setData(prev => [...prev, ...resData.data]);
        }
        setMeta(resData.meta);
      } else if (Array.isArray(resData)) {
        // Fallback: backend returns a plain array (no pagination)
        setData(resData);
        setMeta({ total: resData.length, page: 1, lastPage: 1, limit: resData.length });
      }
    } catch (error) {
      console.error(`[Pagination] Failed to fetch ${endpoint}:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [endpoint, limit]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchPage(1, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (meta && page < meta.lastPage && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage);
    }
  }, [meta, page, loading, fetchPage]);

  const hasMore = meta ? page < meta.lastPage : false;

  return { data, meta, loading, refreshing, loadMore, refresh, hasMore };
}
