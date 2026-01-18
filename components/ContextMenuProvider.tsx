'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import ContextMenu from './ContextMenu';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  selectedText: string;
}

const ContextMenuContext = createContext<{
  openContextMenu: (x: number, y: number, text: string) => void;
  closeContextMenu: () => void;
} | null>(null);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within ContextMenuProvider');
  }
  return context;
};

export default function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    selectedText: '',
  });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Get selected text
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() || '';

      // Only show context menu if text is selected
      if (selectedText && selectedText.length > 0) {
        e.preventDefault();
        setMenuState({
          isOpen: true,
          x: e.clientX,
          y: e.clientY,
          selectedText,
        });
      }
    };

    // Add context menu listener to document
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const openContextMenu = (x: number, y: number, text: string) => {
    setMenuState({
      isOpen: true,
      x,
      y,
      selectedText: text,
    });
  };

  const closeContextMenu = () => {
    setMenuState({
      isOpen: false,
      x: 0,
      y: 0,
      selectedText: '',
    });
  };

  return (
    <ContextMenuContext.Provider value={{ openContextMenu, closeContextMenu }}>
      {children}
      {menuState.isOpen && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          selectedText={menuState.selectedText}
          onClose={closeContextMenu}
        />
      )}
    </ContextMenuContext.Provider>
  );
}
