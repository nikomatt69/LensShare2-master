import { Localstorage } from '@/storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationPersistState {
  notificationCountMap: { profileId: string; count: number }[] | undefined;
  setNotificationCount: (profileId: string, count: number) => void;
  getNotificationCount: (profileId: string) => number;
  latestNotificationId: string | null;
  setLatestNotificationId: (id: string) => void;
  lastOpenedNotificationId: string | null;
  setLastOpenedNotificationId: (id: string) => void;
}

export const useNotificationPersistStore = create(
  persist<NotificationPersistState>(
    (set, get) => ({
      latestNotificationId: null,
      setLatestNotificationId: (id) => set({ latestNotificationId: id }),
      lastOpenedNotificationId: null,
      setLastOpenedNotificationId: (id) =>
        set({ lastOpenedNotificationId: id }),
      notificationCountMap: undefined,
      setNotificationCount: (profileId, count) => {
        const { notificationCountMap } = get();

        if (!notificationCountMap) {
          set({ notificationCountMap: [{ profileId, count }] });
          return;
        }

        const index = notificationCountMap.findIndex(
          (item) => item.profileId === profileId
        );
        if (index > -1) {
          notificationCountMap[index].count = count;
        } else {
          notificationCountMap.push({ profileId, count });
        }
        set({ notificationCountMap });
      },
      getNotificationCount: (profileId) => {
        const { notificationCountMap } = get();

        if (!notificationCountMap) {
          return 0;
        }

        const index = notificationCountMap.findIndex(
          (item) => item.profileId === profileId
        );
        return index > -1 ? notificationCountMap[index].count : 0;
      }
    }),
    { name: Localstorage.NotificationStore }
  )
);
