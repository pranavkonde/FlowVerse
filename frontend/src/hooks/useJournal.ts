import { useState, useEffect } from 'react';
import {
  JournalEntry,
  JournalCollection,
  JournalStats
} from '../types/journal';
import { api } from '../services/api';

interface UseJournalResult {
  entries: JournalEntry[];
  collections: JournalCollection[];
  stats: JournalStats | null;
  loading: boolean;
  error: string | null;
  createEntry: (data: Omit<JournalEntry, 'id' | 'userId' | 'timestamp' | 'isHidden' | 'isPinned'>) => Promise<JournalEntry>;
  updateEntry: (entryId: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  createCollection: (data: { name: string; description: string; isDefault?: boolean }) => Promise<void>;
  updateCollection: (collectionId: string, updates: Partial<JournalCollection>) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  addEntryToCollection: (entryId: string, collectionId: string) => Promise<void>;
  removeEntryFromCollection: (entryId: string, collectionId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useJournal(): UseJournalResult {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [collections, setCollections] = useState<JournalCollection[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [entriesResponse, collectionsResponse, statsResponse] = await Promise.all([
        api.get('/journal/entries'),
        api.get('/journal/collections'),
        api.get('/journal/stats')
      ]);

      setEntries(entriesResponse.data);
      setCollections(collectionsResponse.data);
      setStats(statsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load journal data');
      console.error('Error fetching journal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (data: Omit<JournalEntry, 'id' | 'userId' | 'timestamp' | 'isHidden' | 'isPinned'>): Promise<JournalEntry> => {
    try {
      const response = await api.post('/journal/entries', data);
      const newEntry = response.data;
      setEntries(current => [...current, newEntry]);
      return newEntry;
    } catch (err) {
      console.error('Error creating entry:', err);
      throw err;
    }
  };

  const updateEntry = async (entryId: string, updates: Partial<JournalEntry>) => {
    try {
      const response = await api.put(`/journal/entries/${entryId}`, updates);
      setEntries(current =>
        current.map(entry =>
          entry.id === entryId ? response.data : entry
        )
      );
    } catch (err) {
      console.error('Error updating entry:', err);
      throw err;
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      await api.delete(`/journal/entries/${entryId}`);
      setEntries(current =>
        current.filter(entry => entry.id !== entryId)
      );
      setCollections(current =>
        current.map(collection => ({
          ...collection,
          entries: collection.entries.filter(id => id !== entryId)
        }))
      );
    } catch (err) {
      console.error('Error deleting entry:', err);
      throw err;
    }
  };

  const createCollection = async (data: {
    name: string;
    description: string;
    isDefault?: boolean;
  }) => {
    try {
      const response = await api.post('/journal/collections', data);
      const newCollection = response.data;

      if (newCollection.isDefault) {
        setCollections(current =>
          current.map(collection => ({
            ...collection,
            isDefault: false
          }))
        );
      }

      setCollections(current => [...current, newCollection]);
    } catch (err) {
      console.error('Error creating collection:', err);
      throw err;
    }
  };

  const updateCollection = async (
    collectionId: string,
    updates: Partial<JournalCollection>
  ) => {
    try {
      const response = await api.put(`/journal/collections/${collectionId}`, updates);
      const updatedCollection = response.data;

      if (updatedCollection.isDefault) {
        setCollections(current =>
          current.map(collection => ({
            ...collection,
            isDefault: collection.id === collectionId
          }))
        );
      } else {
        setCollections(current =>
          current.map(collection =>
            collection.id === collectionId ? updatedCollection : collection
          )
        );
      }
    } catch (err) {
      console.error('Error updating collection:', err);
      throw err;
    }
  };

  const deleteCollection = async (collectionId: string) => {
    try {
      await api.delete(`/journal/collections/${collectionId}`);
      setCollections(current =>
        current.filter(collection => collection.id !== collectionId)
      );
    } catch (err) {
      console.error('Error deleting collection:', err);
      throw err;
    }
  };

  const addEntryToCollection = async (entryId: string, collectionId: string) => {
    try {
      await api.post(`/journal/collections/${collectionId}/entries/${entryId}`);
      setCollections(current =>
        current.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                entries: [...collection.entries, entryId]
              }
            : collection
        )
      );
    } catch (err) {
      console.error('Error adding entry to collection:', err);
      throw err;
    }
  };

  const removeEntryFromCollection = async (entryId: string, collectionId: string) => {
    try {
      await api.delete(`/journal/collections/${collectionId}/entries/${entryId}`);
      setCollections(current =>
        current.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                entries: collection.entries.filter(id => id !== entryId)
              }
            : collection
        )
      );
    } catch (err) {
      console.error('Error removing entry from collection:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('entryCreated', (entry: JournalEntry) => {
      setEntries(current => [...current, entry]);
    });

    socket.on('entryUpdated', (entry: JournalEntry) => {
      setEntries(current =>
        current.map(e => (e.id === entry.id ? entry : e))
      );
    });

    socket.on('entryDeleted', ({ entryId }: { entryId: string }) => {
      setEntries(current =>
        current.filter(entry => entry.id !== entryId)
      );
      setCollections(current =>
        current.map(collection => ({
          ...collection,
          entries: collection.entries.filter(id => id !== entryId)
        }))
      );
    });

    socket.on('collectionCreated', (collection: JournalCollection) => {
      if (collection.isDefault) {
        setCollections(current =>
          current.map(c => ({ ...c, isDefault: false }))
        );
      }
      setCollections(current => [...current, collection]);
    });

    socket.on('collectionUpdated', (collection: JournalCollection) => {
      if (collection.isDefault) {
        setCollections(current =>
          current.map(c => ({
            ...c,
            isDefault: c.id === collection.id
          }))
        );
      } else {
        setCollections(current =>
          current.map(c => (c.id === collection.id ? collection : c))
        );
      }
    });

    socket.on('collectionDeleted', ({ collectionId }: { collectionId: string }) => {
      setCollections(current =>
        current.filter(collection => collection.id !== collectionId)
      );
    });

    socket.on('entryAddedToCollection', ({
      entryId,
      collectionId
    }: {
      entryId: string;
      collectionId: string;
    }) => {
      setCollections(current =>
        current.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                entries: [...collection.entries, entryId]
              }
            : collection
        )
      );
    });

    socket.on('entryRemovedFromCollection', ({
      entryId,
      collectionId
    }: {
      entryId: string;
      collectionId: string;
    }) => {
      setCollections(current =>
        current.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                entries: collection.entries.filter(id => id !== entryId)
              }
            : collection
        )
      );
    });

    socket.on('statsUpdated', ({ stats: newStats }: { stats: JournalStats }) => {
      setStats(newStats);
    });

    return () => {
      socket.off('entryCreated');
      socket.off('entryUpdated');
      socket.off('entryDeleted');
      socket.off('collectionCreated');
      socket.off('collectionUpdated');
      socket.off('collectionDeleted');
      socket.off('entryAddedToCollection');
      socket.off('entryRemovedFromCollection');
      socket.off('statsUpdated');
    };
  }, []);

  return {
    entries,
    collections,
    stats,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    createCollection,
    updateCollection,
    deleteCollection,
    addEntryToCollection,
    removeEntryFromCollection,
    refreshData: fetchData
  };
}
