import React, { useState } from 'react';
import {
  JournalEntry,
  JournalCollection,
  ENTRY_TYPE_ICONS,
  ENTRY_TYPE_COLORS,
  DEFAULT_CATEGORIES,
  REWARD_TYPE_ICONS
} from '../../types/journal';
import { useJournal } from '../../hooks/useJournal';

export const JournalSystem: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<JournalCollection | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showCreateEntry, setShowCreateEntry] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const {
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
    removeEntryFromCollection
  } = useJournal();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading journal: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Journal</h2>
          <p className="text-gray-400">
            {stats?.totalEntries || 0} entries • {stats?.streakDays || 0} day streak
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateCollection(true)}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            New Collection
          </button>
          <button
            onClick={() => setShowCreateEntry(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            New Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Collections</h3>
          <div className="space-y-2">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                isSelected={selectedCollection?.id === collection.id}
                onClick={() => setSelectedCollection(collection)}
                onDelete={
                  !collection.isDefault
                    ? () => deleteCollection(collection.id)
                    : undefined
                }
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedCollection ? selectedCollection.name : 'All Entries'}
            </h3>
            {selectedCollection && (
              <button
                onClick={() => setSelectedCollection(null)}
                className="text-gray-400 hover:text-white"
              >
                View All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {entries
              .filter(entry =>
                selectedCollection
                  ? selectedCollection.entries.includes(entry.id)
                  : true
              )
              .map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => setSelectedEntry(entry)}
                  onDelete={() => deleteEntry(entry.id)}
                />
              ))}
          </div>
        </div>
      </div>

      {showCreateEntry && (
        <CreateEntryModal
          onClose={() => setShowCreateEntry(false)}
          onCreate={async (data) => {
            const entry = await createEntry(data);
            if (selectedCollection) {
              await addEntryToCollection(entry.id, selectedCollection.id);
            }
            setShowCreateEntry(false);
          }}
        />
      )}

      {showCreateCollection && (
        <CreateCollectionModal
          onClose={() => setShowCreateCollection(false)}
          onCreate={async (data) => {
            await createCollection(data);
            setShowCreateCollection(false);
          }}
        />
      )}

      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          collections={collections}
          onClose={() => setSelectedEntry(null)}
          onUpdate={updateEntry}
          onAddToCollection={addEntryToCollection}
          onRemoveFromCollection={removeEntryFromCollection}
        />
      )}
    </div>
  );
};

const CollectionCard: React.FC<{
  collection: JournalCollection;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}> = ({ collection, isSelected, onClick, onDelete }) => {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer ${
        isSelected
          ? 'bg-primary text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{collection.name}</div>
          <div className="text-sm opacity-75">
            {collection.entries.length} entries
          </div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-500 hover:text-red-400"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

const EntryCard: React.FC<{
  entry: JournalEntry;
  onClick: () => void;
  onDelete: () => void;
}> = ({ entry, onClick, onDelete }) => {
  const typeColor = ENTRY_TYPE_COLORS[entry.type];
  
  return (
    <div
      onClick={onClick}
      className={`bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors ${
        entry.isPinned ? 'border-l-4 border-primary' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{ENTRY_TYPE_ICONS[entry.type]}</span>
          <div>
            <h4 className="text-lg font-semibold text-white">{entry.title}</h4>
            <p className="text-sm text-gray-400 line-clamp-2">{entry.description}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-sm bg-${typeColor}-500 text-white`}>
            {entry.type}
          </span>
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded text-sm bg-gray-600 text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-sm text-gray-400">
          {new Date(entry.timestamp).toLocaleDateString()}
        </span>
      </div>

      {entry.metadata.rewards && entry.metadata.rewards.length > 0 && (
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-sm text-gray-400">Rewards:</span>
          {entry.metadata.rewards.map((reward, index) => (
            <span key={index} className="flex items-center text-sm">
              {REWARD_TYPE_ICONS[reward.type as keyof typeof REWARD_TYPE_ICONS]}
              <span className="ml-1 text-white">{reward.amount}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateEntryModal: React.FC<{
  onClose: () => void;
  onCreate: (data: Omit<JournalEntry, 'id' | 'userId' | 'timestamp' | 'isHidden' | 'isPinned'>) => Promise<void>;
}> = ({ onClose, onCreate }) => {
  const [type, setType] = useState<JournalEntry['type']>('note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !description) return;

    setLoading(true);
    try {
      await onCreate({
        type,
        title,
        description,
        category,
        tags,
        metadata: {}
      });
    } catch (error) {
      console.error('Failed to create entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">New Journal Entry</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as JournalEntry['type'])}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            >
              {Object.entries(ENTRY_TYPE_ICONS).map(([value, icon]) => (
                <option key={value} value={value}>
                  {icon} {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              placeholder="Entry title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              rows={4}
              placeholder="Write your entry..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              placeholder="Add tags, separated by commas"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !title || !description}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateCollectionModal: React.FC<{
  onClose: () => void;
  onCreate: (data: { name: string; description: string; isDefault?: boolean }) => Promise<void>;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) return;

    setLoading(true);
    try {
      await onCreate({ name, description, isDefault });
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">New Collection</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              placeholder="Collection name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              rows={3}
              placeholder="Collection description"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isDefault" className="text-gray-300">
              Make this the default collection
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !name}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EntryModal: React.FC<{
  entry: JournalEntry;
  collections: JournalCollection[];
  onClose: () => void;
  onUpdate: (entryId: string, updates: Partial<JournalEntry>) => Promise<void>;
  onAddToCollection: (entryId: string, collectionId: string) => Promise<void>;
  onRemoveFromCollection: (entryId: string, collectionId: string) => Promise<void>;
}> = ({
  entry,
  collections,
  onClose,
  onUpdate,
  onAddToCollection,
  onRemoveFromCollection
}) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [description, setDescription] = useState(entry.description);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(entry.id, { title, description });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = async (collectionId: string, isInCollection: boolean) => {
    try {
      if (isInCollection) {
        await onRemoveFromCollection(entry.id, collectionId);
      } else {
        await onAddToCollection(entry.id, collectionId);
      }
    } catch (error) {
      console.error('Failed to update collections:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          {editing ? (
            <div className="flex-1 mr-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 mb-2"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
                rows={4}
              />
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                {ENTRY_TYPE_ICONS[entry.type]} {entry.title}
              </h3>
              <p className="text-gray-400 mt-2 whitespace-pre-wrap">
                {entry.description}
              </p>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{entry.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white">{entry.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {entry.metadata.location && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">{entry.metadata.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {entry.tags.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded bg-gray-700 text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.metadata.rewards && entry.metadata.rewards.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Rewards</h4>
              <div className="grid grid-cols-2 gap-4">
                {entry.metadata.rewards.map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700 rounded p-2"
                  >
                    <span className="flex items-center">
                      {REWARD_TYPE_ICONS[reward.type as keyof typeof REWARD_TYPE_ICONS]}
                      <span className="ml-2 text-gray-300">{reward.type}</span>
                    </span>
                    <span className="text-white">{reward.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Collections</h4>
            <div className="grid grid-cols-2 gap-4">
              {collections.map((collection) => {
                const isInCollection = collection.entries.includes(entry.id);
                return (
                  <button
                    key={collection.id}
                    onClick={() => toggleCollection(collection.id, isInCollection)}
                    className={`flex items-center justify-between p-2 rounded ${
                      isInCollection
                        ? 'bg-primary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span>{collection.name}</span>
                    <span>{isInCollection ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
