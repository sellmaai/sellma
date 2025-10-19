import { useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";

export interface Audience {
  _id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface UseInfiniteAudiencesResult {
  audiences: Audience[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function useInfiniteAudiences(): UseInfiniteAudiencesResult {
  const [allAudiences, setAllAudiences] = useState<Audience[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const queryResult = useQuery(api.userAudiences.listByUserPaginated, {
    limit: 5,
    cursor,
  });

  // Update audiences when new data arrives
  useEffect(() => {
    if (queryResult) {
      if (cursor === undefined) {
        // First load - replace all audiences
        setAllAudiences(queryResult.data);
      } else {
        // Load more - append to existing audiences
        setAllAudiences((prev) => [...prev, ...queryResult.data]);
      }
      setHasMore(queryResult.hasMore);
      setIsLoadingMore(false);
    }
  }, [queryResult, cursor]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && queryResult?.nextCursor) {
      setIsLoadingMore(true);
      setCursor(queryResult.nextCursor);
    }
  }, [isLoadingMore, hasMore, queryResult?.nextCursor]);

  // Filter audiences based on search query
  const filteredAudiences = allAudiences.filter((audience) =>
    audience.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    audiences: filteredAudiences,
    isLoading: queryResult === undefined,
    error: null, // Convex useQuery doesn't return error in this format
    hasMore,
    loadMore,
    isLoadingMore,
    searchQuery,
    setSearchQuery,
  };
}
