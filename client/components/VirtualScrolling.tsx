import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useVirtualList } from "@/lib/performance";

interface VirtualScrollingProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualScrolling<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = "",
  onScroll,
  getItemKey,
}: VirtualScrollingProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { visibleItems, totalHeight, startIndex, setScrollTop } =
    useVirtualList({
      items,
      itemHeight,
      containerHeight,
      overscan,
    });

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      setScrollTop(scrollTop);
      onScroll?.(scrollTop);
    },
    [setScrollTop, onScroll],
  );

  // Memoize rendered items to prevent unnecessary re-renders
  const renderedItems = useMemo(() => {
    return visibleItems.map(({ item, index }) => (
      <div
        key={getItemKey ? getItemKey(item, index) : index}
        style={{
          position: "absolute",
          top: index * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        }}
      >
        {renderItem(item, index)}
      </div>
    ));
  }, [visibleItems, itemHeight, renderItem, getItemKey]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: "relative",
        }}
      >
        {renderedItems}
      </div>
    </div>
  );
}

// Specialized virtual scroll for word lists
interface WordListItem {
  id: number;
  word: string;
  definition: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

interface VirtualWordListProps {
  words: WordListItem[];
  containerHeight: number;
  onWordSelect?: (word: WordListItem) => void;
  selectedWordId?: number;
  className?: string;
}

export const VirtualWordList: React.FC<VirtualWordListProps> = ({
  words,
  containerHeight,
  onWordSelect,
  selectedWordId,
  className,
}) => {
  const itemHeight = 80; // Fixed height for word items

  const renderWordItem = useCallback(
    (word: WordListItem, index: number) => (
      <div
        className={`
        p-3 mx-2 my-1 bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer
        ${selectedWordId === word.id ? "bg-blue-50 border-blue-400" : ""}
      `}
        onClick={() => onWordSelect?.(word)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {word.word}
            </h3>
            <p className="text-sm text-gray-600 truncate">{word.definition}</p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span
              className={`
            px-2 py-1 text-xs rounded-full font-medium
            ${word.difficulty === "easy" ? "bg-green-100 text-green-800" : ""}
            ${word.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" : ""}
            ${word.difficulty === "hard" ? "bg-red-100 text-red-800" : ""}
          `}
            >
              {word.difficulty}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {word.category}
            </span>
          </div>
        </div>
      </div>
    ),
    [onWordSelect, selectedWordId],
  );

  const getWordKey = useCallback((word: WordListItem) => word.id, []);

  return (
    <VirtualScrolling
      items={words}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderWordItem}
      getItemKey={getWordKey}
      className={className}
      overscan={10}
    />
  );
};

// Virtual grid for image/card layouts
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 16,
  getItemKey,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate columns and visible items
  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowsTotal = Math.ceil(items.length / columnsCount);
  const rowHeight = itemHeight + gap;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const endRow = Math.min(
    rowsTotal - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + 2,
  );

  const visibleItems = useMemo(() => {
    const result: Array<{ item: T; index: number; x: number; y: number }> = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columnsCount; col++) {
        const index = row * columnsCount + col;
        if (index >= items.length) break;

        result.push({
          item: items[index],
          index,
          x: col * (itemWidth + gap),
          y: row * rowHeight,
        });
      }
    }

    return result;
  }, [
    items,
    startRow,
    endRow,
    columnsCount,
    itemWidth,
    itemHeight,
    gap,
    rowHeight,
  ]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className="overflow-auto"
      style={{ height: containerHeight, width: containerWidth }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: rowsTotal * rowHeight,
          position: "relative",
          width: "100%",
        }}
      >
        {visibleItems.map(({ item, index, x, y }) => (
          <div
            key={getItemKey ? getItemKey(item, index) : index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for virtual scrolling state management
export function useVirtualScrollState<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after 150ms of no scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const targetScrollTop = index * itemHeight;
      setScrollTop(
        Math.min(
          targetScrollTop,
          Math.max(0, items.length * itemHeight - containerHeight),
        ),
      );
    },
    [items.length, itemHeight, containerHeight],
  );

  const scrollToTop = useCallback(() => {
    setScrollTop(0);
  }, []);

  const scrollToBottom = useCallback(() => {
    setScrollTop(Math.max(0, items.length * itemHeight - containerHeight));
  }, [items.length, itemHeight, containerHeight]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollTop,
    isScrolling,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  };
}

// Performance optimized virtual list with dynamic heights
interface DynamicVirtualListProps<T> {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  renderItem: (
    item: T,
    index: number,
    measureRef: (node: HTMLElement | null) => void,
  ) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

export function DynamicVirtualList<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
  getItemKey,
}: DynamicVirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(
    new Map(),
  );
  const measureRefs = useRef<Map<number, HTMLElement>>(new Map());

  const getItemHeight = useCallback(
    (index: number) => {
      return itemHeights.get(index) ?? estimatedItemHeight;
    },
    [itemHeights, estimatedItemHeight],
  );

  const getTotalHeight = useCallback(() => {
    return items.reduce((total, _, index) => total + getItemHeight(index), 0);
  }, [items, getItemHeight]);

  const getVisibleRange = useCallback(() => {
    let currentTop = 0;
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const itemHeight = getItemHeight(i);
      if (currentTop + itemHeight > scrollTop) {
        startIndex = Math.max(0, i - 2); // Add some overscan
        break;
      }
      currentTop += itemHeight;
    }

    // Find end index
    const viewportBottom = scrollTop + containerHeight;
    currentTop = 0;
    for (let i = 0; i < items.length; i++) {
      currentTop += getItemHeight(i);
      if (currentTop > viewportBottom) {
        endIndex = Math.min(items.length - 1, i + 2); // Add some overscan
        break;
      }
    }

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, items.length, getItemHeight]);

  const { startIndex, endIndex } = getVisibleRange();

  const measureItem = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      if (node) {
        measureRefs.current.set(index, node);
        const height = node.offsetHeight;

        setItemHeights((prev) => {
          if (prev.get(index) !== height) {
            const newMap = new Map(prev);
            newMap.set(index, height);
            return newMap;
          }
          return prev;
        });
      }
    },
    [],
  );

  const getItemTop = useCallback(
    (index: number) => {
      let top = 0;
      for (let i = 0; i < index; i++) {
        top += getItemHeight(i);
      }
      return top;
    },
    [getItemHeight],
  );

  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        item: items[i],
        index: i,
        top: getItemTop(i),
      });
    }
    return result;
  }, [items, startIndex, endIndex, getItemTop]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: getTotalHeight(),
          position: "relative",
        }}
      >
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={getItemKey ? getItemKey(item, index) : index}
            style={{
              position: "absolute",
              top,
              left: 0,
              right: 0,
            }}
          >
            {renderItem(item, index, measureItem(index))}
          </div>
        ))}
      </div>
    </div>
  );
}
