import { create } from 'zustand';
import type { Notification, BlockedResource, SecurityLogEntry, LinkItem } from '@/lib/julius-data';

interface JuliusState {
  // Active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  unreadCount: () => number;

  // Notification panel
  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;

  // IP Data
  ipData: {
    ip: string;
    city: string;
    region: string;
    country: string;
    isp: string;
    isVpn: boolean;
    isProxy: boolean;
    isTor: boolean;
    riskLevel: string;
    vpnSuggested: boolean;
  } | null;
  setIpData: (data: JuliusState['ipData']) => void;

  // Blocked Resources (client-side state for immediate feedback)
  blockedResources: BlockedResource[];
  setBlockedResources: (resources: BlockedResource[]) => void;
  addBlockedResource: (resource: BlockedResource) => void;
  removeBlockedResource: (id: string) => void;

  // Security Log
  securityLog: SecurityLogEntry[];
  setSecurityLog: (log: SecurityLogEntry[]) => void;
  addSecurityLogEntry: (entry: SecurityLogEntry) => void;

  // Security Score
  securityScore: number;
  setSecurityScore: (score: number) => void;

  // Privacy Settings
  privacySettings: Record<string, boolean>;
  setPrivacySettings: (settings: Record<string, boolean>) => void;
  togglePrivacySetting: (key: string) => void;

  // Tunnel
  tunnelEnabled: boolean;
  setTunnelEnabled: (enabled: boolean) => void;
  tunnelType: string;
  setTunnelType: (type: string) => void;

  // Links (client-side state for starred toggling)
  links: LinkItem[];
  setLinks: (links: LinkItem[]) => void;
  toggleLinkStar: (id: string) => void;

  // UTC Clock
  utcTime: string;
  setUtcTime: (time: string) => void;
}

export const useJuliusStore = create<JuliusState>((set, get) => ({
  // Active tab
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Notifications
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  // Notification panel
  notificationPanelOpen: false,
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),

  // IP Data
  ipData: null,
  setIpData: (data) => set({ ipData: data }),

  // Blocked Resources
  blockedResources: [],
  setBlockedResources: (resources) => set({ blockedResources: resources }),
  addBlockedResource: (resource) =>
    set((state) => ({
      blockedResources: [...state.blockedResources, resource],
    })),
  removeBlockedResource: (id) =>
    set((state) => ({
      blockedResources: state.blockedResources.filter((r) => r.id !== id),
    })),

  // Security Log
  securityLog: [],
  setSecurityLog: (log) => set({ securityLog: log }),
  addSecurityLogEntry: (entry) =>
    set((state) => ({
      securityLog: [entry, ...state.securityLog].slice(0, 50),
    })),

  // Security Score
  securityScore: 65,
  setSecurityScore: (score) => set({ securityScore: score }),

  // Privacy Settings
  privacySettings: {
    dnsOverHttps: true,
    webrtcBlocking: true,
    canvasProtection: false,
    referrerStripping: true,
    cookieAutoDelete: false,
    jsRestriction: false,
  },
  setPrivacySettings: (settings) => set({ privacySettings: settings }),
  togglePrivacySetting: (key) =>
    set((state) => ({
      privacySettings: {
        ...state.privacySettings,
        [key]: !state.privacySettings[key],
      },
    })),

  // Tunnel
  tunnelEnabled: false,
  setTunnelEnabled: (enabled) => set({ tunnelEnabled: enabled }),
  tunnelType: 'socks5',
  setTunnelType: (type) => set({ tunnelType: type }),

  // Links
  links: [],
  setLinks: (links) => set({ links }),
  toggleLinkStar: (id) =>
    set((state) => ({
      links: state.links.map((l) =>
        l.id === id ? { ...l, starred: !l.starred } : l
      ),
    })),

  // UTC Clock
  utcTime: new Date().toUTCString(),
  setUtcTime: (time) => set({ utcTime: time }),
}));
