import { useState, useEffect } from 'react';
import {
  JournalEntry,
  JournalCollection,
  JournalStats,
  JournalTemplate,
  JournalFilter
} from '../types/journal';
import { api } from '../services/api';

interface UseJournalResult {
  entries: JournalEntry[];
  collections: JournalCollection[];
  templates: JournalTemplate[];
  stats: JournalStats | null;
  loading: boolean;
  error: string | null;
  createEntry: (data: Partial<JournalEntry>) => Promise<JournalEntry>;
  updateEntry: (
    entryId: string,
    updates: Partial<JournalEntry>
  ) => Promise<JournalEntry>;
  deleteEntry: (entryId: string) => Promise<void>;
  createCollection: (
    data: Partial<JournalCollection>
  ) => Promise<JournalCollection>;
  updateCollection: (
    collectionId: string,
    updates: Partial<JournalCollection>
  ) => Promise<JournalCollection>;
  addEntryToCollection: (
    entryId: string,
    collectionId: string
  ) => Promise<JournalCollection>;
  removeEntryFromCollection: (
    entryId: string,
    collectionId: string
  ) => Promise<JournalCollection>;
  searchEntries: (filter: JournalFilter) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useJournal(): UseJournalResult {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [collections, setCollections] = useState<JournalCollection[]>([]);
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async (filter?: JournalFilter) => {
    try {
      const response = await api.get('/journal/entries', {
        params: filter
      });
      setEntries(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError('Failed to load journal entries');
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await api.get('/journal/collections');
      setCollections(response.data);
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/journal/templates');
      setTemplates(response.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/journal/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching journal stats:', err);
    }
  };

  const createEntry = async (
    data: Partial<JournalEntry>
  ): Promise<JournalEntry> => {
    try {
      const response = await api.post('/journal/entries', data);
      const newEntry = response.data;
      setEntries(current => [...current, newEntry]);
      await fetchStats();
      return newEntry;
    } catch (err) {
      console.error('Error creating entry:', err);
      throw err;
    }
  };

  const updateEntry = async (
    entryId: string,
    updates: Partial<JournalEntry>
  ): Promise<JournalEntry> => {
    try {
      const response = await api.put(
        `/journal/entries/${entryId}`,
        updates
      );
      const updatedEntry = response.data;
      setEntries(current =>
        current.map(entry =>
          entry.id === entryId ? updatedEntry : entry
        )
      );
      return updatedEntry;
    } catch (err) {
      console.error('Error updating entry:', err);
      throw err;
    }
  };

  const deleteEntry = async (entryId: string): Promise<void> => {
    try {
      await api.delete(`/journal/entries/${entryId}`);
      setEntries(current =>
        current.filter(entry => entry.id !== entryId)
      );
      await fetchStats();
    } catch (err) {
      console.error('Error deleting entry:', err);
      throw err;
    }
  };

  const createCollection = async (
    data: Partial<JournalCollection>
  ): Promise<JournalCollection> => {
    try {
      const response = await api.post('/journal/collections', data);
      const newCollection = response.data;
      setCollections(current => [...current, newCollection]);
      return newCollection;
    } catch (err) {
      console.error('Error creating collection:', err);
      throw err;
    }
  };

  const updateCollection = async (
    collectionId: string,
    updates: Partial<JournalCollection>
  ): Promise<JournalCollection> => {
    try {
      const response = await api.put(
        `/journal/collections/${collectionId}`,
        updates
      );
      const updatedCollection = response.data;
      setCollections(current =>
        current.map(collection =>
          collection.id === collectionId ? updatedCollection : collection
        )
      );
      return updatedCollection;
    } catch (err) {
      console.error('Error updating collection:', err);
      throw err;
    }
  };

  const addEntryToCollection = async (
    entryId: string,
    collectionId: string
  ): Promise<JournalCollection> => {
    try {
      const response = await api.post(
        `/journal/collections/${collectionId}/entries/${entryId}`
      );
      const updatedCollection = response.data;
      setCollections(current =>
        current.map(collection =>
          collection.id === collectionId ? updatedCollection : collection
        )
      );
      return updatedCollection;
    } catch (err) {
      console.error('Error adding entry to collection:', err);
      throw err;
    }
  };

  const removeEntryFromCollection = async (
    entryId: string,
    collectionId: string
  ): Promise<JournalCollection> => {
    try {
      const response = await api.delete(
        `/journal/collections/${collectionId}/entries/${entryId}`
      );
      const updatedCollection = response.data;
      setCollections(current =>
        current.map(collection =>
          collection.id === collectionId ? updatedCollection : collection
        )
      );
      return updatedCollection;
    } catch (err) {
      console.error('Error removing entry from collection:', err);
      throw err;
    }
  };

  const searchEntries = async (filter: JournalFilter): Promise<void> => {
    await fetchEntries(filter);
  };

  const refreshData = async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEntries(),
        fetchCollections(),
        fetchTemplates(),
        fetchStats()
      ]);
      setError(null);
    } catch (err) {
      setError('Failed to refresh journal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('entry:created', ({ entryId }) => {
      fetchEntries();
      fetchStats();
    });

    socket.on('entry:updated', ({ entryId }) => {
      fetchEntries();
    });

    socket.on('entry:deleted', ({ entryId }) => {
      fetchEntries();
      fetchStats();
    });

    socket.on('collection:created', ({ collectionId }) => {
      fetchCollections();
    });

    socket.on('collection:updated', ({ collectionId }) => {
      fetchCollections();
    });

    socket.on('collection:entry-added', ({ collectionId }) => {
      fetchCollections();
    });

    socket.on('collection:entry-removed', ({ collectionId }) => {
      fetchCollections();
    });

    return () => {
      socket.off('entry:created');
      socket.off('entry:updated');
      socket.off('entry:deleted');
      socket.off('collection:created');
      socket.off('collection:updated');
      socket.off('collection:entry-added');
      socket.off('collection:entry-removed');
    };
  }, []);

  return {
    entries,
    collections,
    templates,
    stats,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    createCollection,
    updateCollection,
    addEntryToCollection,
    removeEntryFromCollection,
    searchEntries,
    refreshData
  };
}