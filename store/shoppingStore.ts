import { create } from 'zustand';
import { getDb } from '@/lib/database';
import { randomUUID } from 'expo-crypto';
import type { ShoppingSection, ShoppingItem } from '@/types';

interface ShoppingState {
  sections: ShoppingSection[];
  items: ShoppingItem[];
  loading: boolean;
  load: () => Promise<void>;
  addSection: (name: string) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  addItem: (sectionId: string, name: string) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearChecked: () => Promise<void>;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  sections: [],
  items: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    const db = await getDb();
    const sectionRows = await db.getAllAsync(
      'SELECT * FROM shopping_sections ORDER BY sort_order ASC'
    ) as Record<string, unknown>[];
    const itemRows = await db.getAllAsync(
      'SELECT * FROM shopping_items ORDER BY sort_order ASC'
    ) as Record<string, unknown>[];

    set({
      sections: sectionRows.map(r => ({
        id: r.id as string,
        name: r.name as string,
        sortOrder: r.sort_order as number,
      })),
      items: itemRows.map(r => ({
        id: r.id as string,
        sectionId: r.section_id as string,
        name: r.name as string,
        isChecked: Boolean(r.is_checked),
        sortOrder: r.sort_order as number,
      })),
      loading: false,
    });
  },

  addSection: async (name) => {
    const db = await getDb();
    const id = randomUUID();
    const sortOrder = get().sections.length;
    await db.runAsync(
      'INSERT INTO shopping_sections (id, name, sort_order) VALUES (?, ?, ?)',
      [id, name.trim(), sortOrder]
    );
    set(s => ({
      sections: [...s.sections, { id, name: name.trim(), sortOrder }],
    }));
  },

  deleteSection: async (id) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM shopping_sections WHERE id = ?', [id]);
    set(s => ({
      sections: s.sections.filter(sec => sec.id !== id),
      items: s.items.filter(item => item.sectionId !== id),
    }));
  },

  addItem: async (sectionId, name) => {
    const db = await getDb();
    const id = randomUUID();
    const sortOrder = get().items.filter(i => i.sectionId === sectionId).length;
    await db.runAsync(
      'INSERT INTO shopping_items (id, section_id, name, sort_order) VALUES (?, ?, ?, ?)',
      [id, sectionId, name.trim(), sortOrder]
    );
    set(s => ({
      items: [...s.items, { id, sectionId, name: name.trim(), isChecked: false, sortOrder }],
    }));
  },

  toggleItem: async (id) => {
    const item = get().items.find(i => i.id === id);
    if (!item) return;
    const db = await getDb();
    const next = !item.isChecked;
    await db.runAsync('UPDATE shopping_items SET is_checked = ? WHERE id = ?', [next ? 1 : 0, id]);
    set(s => ({
      items: s.items.map(i => i.id === id ? { ...i, isChecked: next } : i),
    }));
  },

  deleteItem: async (id) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM shopping_items WHERE id = ?', [id]);
    set(s => ({ items: s.items.filter(i => i.id !== id) }));
  },

  clearChecked: async () => {
    const db = await getDb();
    await db.runAsync('DELETE FROM shopping_items WHERE is_checked = 1');
    set(s => ({ items: s.items.filter(i => !i.isChecked) }));
  },
}));
