import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  darkMode: false,
  sidebarOpen: false,
  notifications: [],

  toggleDarkMode: () => {
    const newMode = !get().darkMode;
    set({ darkMode: newMode });
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  },

  initDarkMode: () => {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enabled = saved ? saved === 'true' : prefersDark;
    set({ darkMode: enabled });
    if (enabled) document.documentElement.classList.add('dark');
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  addNotification: (notification) => {
    const id = Date.now();
    set((s) => ({
      notifications: [{ id, ...notification, createdAt: new Date() }, ...s.notifications].slice(0, 20)
    }));
    return id;
  },

  removeNotification: (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
  },

  clearNotifications: () => set({ notifications: [] }),
}));

export default useUIStore;
