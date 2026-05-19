import type { OfflineSyncItem } from '../types/domain';

export interface OfflineConflict {
  item: OfflineSyncItem;
  reason: string;
}

export function detectOfflineConflict(item: OfflineSyncItem, serverUpdatedAt?: string): OfflineConflict | null {
  if (!serverUpdatedAt) {
    return null;
  }

  const localUpdatedAt = typeof item.payload.updatedAt === 'string' ? item.payload.updatedAt : item.createdAt;
  if (new Date(serverUpdatedAt).getTime() > new Date(localUpdatedAt).getTime()) {
    return {
      item: { ...item, status: 'conflict', conflictReason: 'server_newer' },
      reason: 'La donnee serveur est plus recente que la saisie locale'
    };
  }

  return null;
}

export function markOfflineItemSynced(item: OfflineSyncItem, syncedAt: string): OfflineSyncItem {
  return {
    ...item,
    status: 'synced',
    syncedAt
  };
}
