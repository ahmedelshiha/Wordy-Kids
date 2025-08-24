/**
 * Database Optimization and Virtual Datasets
 * Efficient data structures and query optimization for large datasets
 */

interface IndexedData<T> {
  data: T[];
  indexes: Map<string, Map<any, number[]>>;
  primaryKey: keyof T;
}

interface QueryOptions {
  filter?: Record<string, any>;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
  search?: { fields: string[]; term: string };
}

interface QueryResult<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
  executionTime: number;
}

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  queryHash: string;
  accessCount: number;
}

class VirtualDatabase<T> {
  private indexedData: IndexedData<T>;
  private queryCache = new Map<string, CacheEntry<T>>();
  private maxCacheSize = 100;
  private cacheExpiryTime = 5 * 60 * 1000; // 5 minutes

  constructor(data: T[], primaryKey: keyof T, indexFields: (keyof T)[] = []) {
    this.indexedData = {
      data: [...data],
      indexes: new Map(),
      primaryKey
    };

    this.buildIndexes([primaryKey, ...indexFields]);
    console.log(`VirtualDatabase initialized with ${data.length} records and ${indexFields.length + 1} indexes`);
  }

  // Build indexes for fast lookups
  private buildIndexes(fields: (keyof T)[]): void {
    const startTime = performance.now();

    fields.forEach(field => {
      const index = new Map<any, number[]>();
      
      this.indexedData.data.forEach((item, index_pos) => {
        const value = item[field];
        if (!index.has(value)) {
          index.set(value, []);
        }
        index.get(value)!.push(index_pos);
      });

      this.indexedData.indexes.set(String(field), index);
    });

    const endTime = performance.now();
    console.log(`Indexes built in ${(endTime - startTime).toFixed(2)}ms`);
  }

  // Execute optimized query
  query(options: QueryOptions = {}): QueryResult<T> {
    const startTime = performance.now();
    const queryHash = this.generateQueryHash(options);

    // Check cache first
    const cached = this.getFromCache(queryHash);
    if (cached) {
      return {
        ...cached,
        executionTime: performance.now() - startTime
      };
    }

    let resultIndices = this.getInitialResultSet(options.filter);

    // Apply search filter
    if (options.search) {
      resultIndices = this.applySearchFilter(resultIndices, options.search);
    }

    // Apply sorting
    if (options.sort && options.sort.length > 0) {
      resultIndices = this.applySorting(resultIndices, options.sort);
    }

    const totalCount = resultIndices.length;

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || resultIndices.length;
    const paginatedIndices = resultIndices.slice(offset, offset + limit);

    const data = paginatedIndices.map(index => this.indexedData.data[index]);
    const hasMore = offset + limit < totalCount;

    const result: QueryResult<T> = {
      data,
      totalCount,
      hasMore,
      executionTime: performance.now() - startTime
    };

    // Cache the result
    this.cacheResult(queryHash, data, totalCount, hasMore);

    return result;
  }

  // Get initial result set using indexes when possible
  private getInitialResultSet(filter?: Record<string, any>): number[] {
    if (!filter || Object.keys(filter).length === 0) {
      return Array.from({ length: this.indexedData.data.length }, (_, i) => i);
    }

    const filterEntries = Object.entries(filter);
    let resultIndices: number[] | null = null;

    // Try to use indexes for filtering
    for (const [field, value] of filterEntries) {
      const index = this.indexedData.indexes.get(field);
      
      if (index) {
        const fieldIndices = index.get(value) || [];
        
        if (resultIndices === null) {
          resultIndices = [...fieldIndices];
        } else {
          // Intersection of results
          resultIndices = resultIndices.filter(idx => fieldIndices.includes(idx));
        }
      } else {
        // Fallback to linear scan for non-indexed fields
        const scanIndices = this.indexedData.data
          .map((item, idx) => ({ item, idx }))
          .filter(({ item }) => item[field as keyof T] === value)
          .map(({ idx }) => idx);

        if (resultIndices === null) {
          resultIndices = scanIndices;
        } else {
          resultIndices = resultIndices.filter(idx => scanIndices.includes(idx));
        }
      }

      // Early termination if no results
      if (resultIndices.length === 0) {
        break;
      }
    }

    return resultIndices || [];
  }

  // Apply search filter
  private applySearchFilter(indices: number[], search: { fields: string[]; term: string }): number[] {
    const searchTerm = search.term.toLowerCase();
    
    return indices.filter(idx => {
      const item = this.indexedData.data[idx];
      return search.fields.some(field => {
        const value = String(item[field as keyof T]).toLowerCase();
        return value.includes(searchTerm);
      });
    });
  }

  // Apply sorting
  private applySorting(indices: number[], sortOptions: { field: string; direction: 'asc' | 'desc' }[]): number[] {
    return indices.sort((aIdx, bIdx) => {
      const a = this.indexedData.data[aIdx];
      const b = this.indexedData.data[bIdx];

      for (const { field, direction } of sortOptions) {
        const aValue = a[field as keyof T];
        const bValue = b[field as keyof T];

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;

        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }
      }

      return 0;
    });
  }

  // Generate cache key
  private generateQueryHash(options: QueryOptions): string {
    return btoa(JSON.stringify(options));
  }

  // Get from cache
  private getFromCache(queryHash: string): QueryResult<T> | null {
    const cached = this.queryCache.get(queryHash);
    
    if (!cached) return null;

    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.cacheExpiryTime) {
      this.queryCache.delete(queryHash);
      return null;
    }

    // Update access count
    cached.accessCount++;

    return {
      data: cached.data,
      totalCount: cached.data.length,
      hasMore: false,
      executionTime: 0 // Cached result
    };
  }

  // Cache result
  private cacheResult(queryHash: string, data: T[], totalCount: number, hasMore: boolean): void {
    // Limit cache size
    if (this.queryCache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.queryCache.set(queryHash, {
      data: [...data],
      timestamp: Date.now(),
      queryHash,
      accessCount: 1
    });
  }

  // Evict least recently used cache entries
  private evictLeastRecentlyUsed(): void {
    let oldestEntry: [string, CacheEntry<T>] | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.queryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestEntry = [key, entry];
      }
    }

    if (oldestEntry) {
      this.queryCache.delete(oldestEntry[0]);
    }
  }

  // Add new data
  insert(item: T): void {
    const newIndex = this.indexedData.data.length;
    this.indexedData.data.push(item);

    // Update indexes
    for (const [field, index] of this.indexedData.indexes.entries()) {
      const value = item[field as keyof T];
      if (!index.has(value)) {
        index.set(value, []);
      }
      index.get(value)!.push(newIndex);
    }

    this.clearCache();
  }

  // Update existing data
  update(primaryKeyValue: any, updates: Partial<T>): boolean {
    const primaryIndex = this.indexedData.indexes.get(String(this.indexedData.primaryKey));
    if (!primaryIndex) return false;

    const indices = primaryIndex.get(primaryKeyValue);
    if (!indices || indices.length === 0) return false;

    const index = indices[0];
    const oldItem = this.indexedData.data[index];
    const newItem = { ...oldItem, ...updates };

    this.indexedData.data[index] = newItem;

    // Update indexes
    this.updateIndexesForItem(index, oldItem, newItem);
    this.clearCache();

    return true;
  }

  // Delete data
  delete(primaryKeyValue: any): boolean {
    const primaryIndex = this.indexedData.indexes.get(String(this.indexedData.primaryKey));
    if (!primaryIndex) return false;

    const indices = primaryIndex.get(primaryKeyValue);
    if (!indices || indices.length === 0) return false;

    const index = indices[0];
    const item = this.indexedData.data[index];

    // Remove from data array (mark as deleted to avoid reindexing)
    this.indexedData.data[index] = null as any;

    // Remove from indexes
    for (const [field, indexMap] of this.indexedData.indexes.entries()) {
      const value = item[field as keyof T];
      const valueIndices = indexMap.get(value);
      if (valueIndices) {
        const pos = valueIndices.indexOf(index);
        if (pos !== -1) {
          valueIndices.splice(pos, 1);
          if (valueIndices.length === 0) {
            indexMap.delete(value);
          }
        }
      }
    }

    this.clearCache();
    return true;
  }

  // Update indexes for a specific item
  private updateIndexesForItem(index: number, oldItem: T, newItem: T): void {
    for (const [field, indexMap] of this.indexedData.indexes.entries()) {
      const oldValue = oldItem[field as keyof T];
      const newValue = newItem[field as keyof T];

      if (oldValue !== newValue) {
        // Remove from old value
        const oldIndices = indexMap.get(oldValue);
        if (oldIndices) {
          const pos = oldIndices.indexOf(index);
          if (pos !== -1) {
            oldIndices.splice(pos, 1);
            if (oldIndices.length === 0) {
              indexMap.delete(oldValue);
            }
          }
        }

        // Add to new value
        if (!indexMap.has(newValue)) {
          indexMap.set(newValue, []);
        }
        indexMap.get(newValue)!.push(index);
      }
    }
  }

  // Clear cache
  private clearCache(): void {
    this.queryCache.clear();
  }

  // Get statistics
  getStats(): {
    recordCount: number;
    indexCount: number;
    cacheSize: number;
    memoryUsage: number;
  } {
    const recordCount = this.indexedData.data.filter(item => item !== null).length;
    const indexCount = this.indexedData.indexes.size;
    const cacheSize = this.queryCache.size;
    
    // Estimate memory usage
    const dataSize = JSON.stringify(this.indexedData.data).length * 2; // Approximate UTF-16 encoding
    const indexSize = Array.from(this.indexedData.indexes.values())
      .reduce((sum, index) => sum + index.size * 10, 0); // Rough estimate
    const memoryUsage = dataSize + indexSize;

    return {
      recordCount,
      indexCount,
      cacheSize,
      memoryUsage
    };
  }
}

// Specialized database for words
export class WordDatabase extends VirtualDatabase<any> {
  constructor(words: any[]) {
    super(words, 'id', ['category', 'difficulty', 'word']);
  }

  // Find words by category with caching
  findByCategory(category: string, options: Omit<QueryOptions, 'filter'> = {}): QueryResult<any> {
    return this.query({
      ...options,
      filter: { category }
    });
  }

  // Search words by term
  searchWords(term: string, options: Omit<QueryOptions, 'search'> = {}): QueryResult<any> {
    return this.query({
      ...options,
      search: {
        fields: ['word', 'definition', 'example'],
        term
      }
    });
  }

  // Get words by difficulty
  findByDifficulty(difficulty: string, options: Omit<QueryOptions, 'filter'> = {}): QueryResult<any> {
    return this.query({
      ...options,
      filter: { difficulty }
    });
  }

  // Get random words efficiently
  getRandomWords(count: number, filter?: Record<string, any>): any[] {
    const baseQuery = filter ? this.query({ filter }) : this.query();
    const availableWords = baseQuery.data;
    
    if (availableWords.length <= count) {
      return availableWords;
    }

    const randomWords = [];
    const usedIndices = new Set<number>();
    
    while (randomWords.length < count && usedIndices.size < availableWords.length) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        randomWords.push(availableWords[randomIndex]);
      }
    }
    
    return randomWords;
  }
}

// Pagination helper
export class PaginationHelper<T> {
  private database: VirtualDatabase<T>;
  private currentQuery: QueryOptions = {};
  private currentPage = 1;
  private pageSize = 20;

  constructor(database: VirtualDatabase<T>) {
    this.database = database;
  }

  // Set query parameters
  setQuery(query: QueryOptions): this {
    this.currentQuery = query;
    this.currentPage = 1;
    return this;
  }

  // Set page size
  setPageSize(size: number): this {
    this.pageSize = size;
    this.currentPage = 1;
    return this;
  }

  // Get current page
  getCurrentPage(): QueryResult<T> & { page: number; pageSize: number; totalPages: number } {
    const offset = (this.currentPage - 1) * this.pageSize;
    const result = this.database.query({
      ...this.currentQuery,
      limit: this.pageSize,
      offset
    });

    const totalPages = Math.ceil(result.totalCount / this.pageSize);

    return {
      ...result,
      page: this.currentPage,
      pageSize: this.pageSize,
      totalPages
    };
  }

  // Navigate pages
  nextPage(): this {
    this.currentPage++;
    return this;
  }

  previousPage(): this {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    return this;
  }

  goToPage(page: number): this {
    this.currentPage = Math.max(1, page);
    return this;
  }
}

// React hooks for database operations
export function useVirtualDatabase<T>(data: T[], primaryKey: keyof T, indexFields: (keyof T)[] = []) {
  const database = React.useMemo(() => {
    return new VirtualDatabase(data, primaryKey, indexFields);
  }, [data, primaryKey, indexFields]);

  const [queryResult, setQueryResult] = React.useState<QueryResult<T> | null>(null);
  const [loading, setLoading] = React.useState(false);

  const executeQuery = React.useCallback(async (options: QueryOptions = {}) => {
    setLoading(true);
    
    // Simulate async operation for consistency
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const result = database.query(options);
    setQueryResult(result);
    setLoading(false);
    
    return result;
  }, [database]);

  const insert = React.useCallback((item: T) => {
    database.insert(item);
  }, [database]);

  const update = React.useCallback((primaryKeyValue: any, updates: Partial<T>) => {
    return database.update(primaryKeyValue, updates);
  }, [database]);

  const remove = React.useCallback((primaryKeyValue: any) => {
    return database.delete(primaryKeyValue);
  }, [database]);

  const getStats = React.useCallback(() => {
    return database.getStats();
  }, [database]);

  return {
    database,
    queryResult,
    loading,
    executeQuery,
    insert,
    update,
    remove,
    getStats
  };
}

// Hook for paginated data
export function usePaginatedData<T>(
  database: VirtualDatabase<T>,
  initialQuery: QueryOptions = {},
  initialPageSize = 20
) {
  const pagination = React.useMemo(() => {
    return new PaginationHelper(database).setQuery(initialQuery).setPageSize(initialPageSize);
  }, [database, initialQuery, initialPageSize]);

  const [currentData, setCurrentData] = React.useState(pagination.getCurrentPage());
  const [loading, setLoading] = React.useState(false);

  const loadPage = React.useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 0));
    const result = pagination.getCurrentPage();
    setCurrentData(result);
    setLoading(false);
  }, [pagination]);

  const nextPage = React.useCallback(() => {
    pagination.nextPage();
    loadPage();
  }, [pagination, loadPage]);

  const previousPage = React.useCallback(() => {
    pagination.previousPage();
    loadPage();
  }, [pagination, loadPage]);

  const goToPage = React.useCallback((page: number) => {
    pagination.goToPage(page);
    loadPage();
  }, [pagination, loadPage]);

  const updateQuery = React.useCallback((query: QueryOptions) => {
    pagination.setQuery(query);
    loadPage();
  }, [pagination, loadPage]);

  React.useEffect(() => {
    loadPage();
  }, [loadPage]);

  return {
    data: currentData.data,
    page: currentData.page,
    pageSize: currentData.pageSize,
    totalPages: currentData.totalPages,
    totalCount: currentData.totalCount,
    hasMore: currentData.hasMore,
    loading,
    nextPage,
    previousPage,
    goToPage,
    updateQuery
  };
}
