import React, { useState } from 'react';
import { useJournal } from '../../hooks/useJournal';
import {
  JournalEntry,
  JournalCollection,
  JournalTemplate,
  JournalCategory,
  EntityType
} from '../../types/journal';

const CATEGORY_ICONS = {
  QUEST: '📜',
  ACHIEVEMENT: '🏆',
  COMBAT: '⚔️',
  CRAFTING: '⚒️',
  EXPLORATION: '🗺️',
  SOCIAL: '👥',
  TRADING: '💰',
  FARMING: '🌾',
  FISHING: '🎣',
  PERSONAL: '📝',
  NOTE: '📌'
};

const ENTITY_ICONS = {
  PLAYER: '👤',
  NPC: '🤖',
  ITEM: '📦',
  LOCATION: '📍',
  QUEST: '📜',
  ACHIEVEMENT: '🏆',
  MONSTER: '👾',
  EVENT: '🎉'
};

export function JournalSystem() {
  const {
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
    searchEntries
  } = useJournal();

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<JournalCollection | null>(null);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JournalCategory | null>(null);

  if (loading) {
    return <div className="p-4">Loading journal system...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const handleSearch = () => {
    searchEntries({
      searchText,
      categories: selectedCategory ? [selectedCategory] : undefined,
      collections: selectedCollection ? [selectedCollection.id] : undefined
    });
  };

  const handleCreateEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    try {
      const entry = await createEntry({
        title: data.get('title') as string,
        content: data.get('content') as string,
        category: data.get('category') as JournalCategory,
        tags: (data.get('tags') as string).split(',').map(tag => tag.trim()),
        isPrivate: data.get('isPrivate') === 'true'
      });

      if (selectedCollection) {
        await addEntryToCollection(entry.id, selectedCollection.id);
      }

      setShowNewEntryForm(false);
      setSelectedEntry(entry);
    } catch (err) {
      console.error('Failed to create entry:', err);
    }
  };

  const handleCreateCollection = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    try {
      const collection = await createCollection({
        name: data.get('name') as string,
        description: data.get('description') as string,
        icon: data.get('icon') as string,
        color: data.get('color') as string
      });
      setShowNewCollectionForm(false);
      setSelectedCollection(collection);
    } catch (err) {
      console.error('Failed to create collection:', err);
    }
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Journal Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalEntries}
            </div>
            <div className="text-sm text-gray-400">Total Entries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalCollections}
            </div>
            <div className="text-sm text-gray-400">Collections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.longestStreak}
            </div>
            <div className="text-sm text-gray-400">Longest Streak</div>
          </div>
        </div>

        {stats.mostUsedTags.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Most Used Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.mostUsedTags.map(({ tag, count }) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-700 rounded text-sm text-white"
                >
                  #{tag} ({count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNewEntryForm = () => (
    <form
      onSubmit={handleCreateEntry}
      className="bg-gray-800 rounded-lg p-4 mb-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">New Journal Entry</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            type="text"
            name="title"
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Content</label>
          <textarea
            name="content"
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
            rows={6}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              name="category"
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            >
              {Object.entries(CATEGORY_ICONS).map(([category, icon]) => (
                <option key={category} value={category}>
                  {icon} {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tags</label>
            <input
              type="text"
              name="tags"
              placeholder="Comma-separated tags"
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPrivate"
              value="true"
              className="form-checkbox"
            />
            <span className="text-gray-400">Private Entry</span>
          </label>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowNewEntryForm(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Entry
          </button>
        </div>
      </div>
    </form>
  );

  const renderNewCollectionForm = () => (
    <form
      onSubmit={handleCreateCollection}
      className="bg-gray-800 rounded-lg p-4 mb-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">New Collection</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Name</label>
          <input
            type="text"
            name="name"
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            name="description"
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Icon</label>
            <input
              type="text"
              name="icon"
              placeholder="Emoji or icon"
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Color</label>
            <input
              type="color"
              name="color"
              className="w-full bg-gray-700 rounded h-10"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowNewCollectionForm(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Collection
          </button>
        </div>
      </div>
    </form>
  );

  const renderEntry = (entry: JournalEntry) => (
    <div
      key={entry.id}
      className={`
        bg-gray-700 rounded-lg p-4 cursor-pointer
        ${selectedEntry?.id === entry.id ? 'ring-2 ring-blue-500' : ''}
        hover:bg-gray-600 transition-colors
      `}
      onClick={() => setSelectedEntry(entry)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-white">
          {CATEGORY_ICONS[entry.category]} {entry.title}
        </h3>
        <div className="flex items-center space-x-2">
          {entry.isPinned && <span className="text-yellow-500">📌</span>}
          {entry.isPrivate && <span className="text-gray-400">🔒</span>}
        </div>
      </div>

      <div className="text-gray-300 mb-2 line-clamp-3">
        {entry.content}
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {entry.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-600 rounded text-xs text-white"
          >
            #{tag}
          </span>
        ))}
      </div>

      {entry.linkedEntities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.linkedEntities.map(entity => (
            <span
              key={entity.id}
              className="flex items-center px-2 py-1 bg-gray-600 rounded text-xs text-white"
            >
              {ENTITY_ICONS[entity.type]} {entity.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
        <span>
          {new Date(entry.createdAt).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={e => {
              e.stopPropagation();
              updateEntry(entry.id, {
                isPinned: !entry.isPinned
              });
            }}
            className="hover:text-yellow-500"
          >
            📌
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              if (confirm('Delete this entry?')) {
                deleteEntry(entry.id);
              }
            }}
            className="hover:text-red-500"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );

  const renderCollection = (collection: JournalCollection) => (
    <div
      key={collection.id}
      className={`
        rounded-lg p-4 cursor-pointer
        ${selectedCollection?.id === collection.id ? 'ring-2 ring-blue-500' : ''}
        hover:bg-opacity-90 transition-colors
      `}
      style={{ backgroundColor: collection.color }}
      onClick={() => setSelectedCollection(collection)}
    >
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-2xl">{collection.icon}</span>
        <h3 className="text-lg font-semibold text-white">
          {collection.name}
        </h3>
      </div>

      <p className="text-white text-opacity-80 mb-2">
        {collection.description}
      </p>

      <div className="text-sm text-white text-opacity-60">
        {collection.entries.length} entries
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Journal</h1>
        <div className="space-x-2">
          <button
            onClick={() => setShowNewEntryForm(!showNewEntryForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showNewEntryForm ? 'Cancel' : 'New Entry'}
          </button>
          <button
            onClick={() => setShowNewCollectionForm(!showNewCollectionForm)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {showNewCollectionForm ? 'Cancel' : 'New Collection'}
          </button>
        </div>
      </div>

      {renderStats()}

      {showNewEntryForm && renderNewEntryForm()}
      {showNewCollectionForm && renderNewCollectionForm()}

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search entries..."
            className="flex-1 bg-gray-700 text-white rounded px-3 py-2"
          />
          <select
            value={selectedCategory || ''}
            onChange={e => setSelectedCategory(
              e.target.value as JournalCategory || null
            )}
            className="bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_ICONS).map(([category, icon]) => (
              <option key={category} value={category}>
                {icon} {category}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {collections.map(renderCollection)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map(renderEntry)}
      </div>
    </div>
  );
}