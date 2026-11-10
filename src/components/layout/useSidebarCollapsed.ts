import { useCallback, useState } from 'react';
import { readStored, writeStored } from '@/lib';

const KEY = 'cc118.sidebar.collapsed';

export function useSidebarCollapsed(): [collapsed: boolean, toggle: () => void] {
  const [collapsed, setCollapsed] = useState(() => readStored(KEY) === '1');

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writeStored(KEY, next ? '1' : null);
      return next;
    });
  }, []);

  return [collapsed, toggle];
}
