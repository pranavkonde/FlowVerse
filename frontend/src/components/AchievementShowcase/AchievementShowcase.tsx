import React, { useState } from 'react';
import {
  Showcase,
  ShowcaseAchievement,
  ShowcaseTheme,
  LAYOUT_OPTIONS,
  ANIMATION_OPTIONS,
  BORDER_STYLES
} from '../../types/achievementShowcase';
import { useAchievementShowcase } from '../../hooks/useAchievementShowcase';

export const AchievementShowcase: React.FC = () => {
  const [selectedShowcase, setSelectedShowcase] = useState<Showcase | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {
    showcases,
    publicShowcases,
    themes,
    loading,
    error,
    createShowcase,
    updateShowcase,
    deleteShowcase,
    addAchievement,
    updateAchievement,
    removeAchievement,
    likeShowcase,
    unlikeShowcase
  } = useAchievementShowcase();

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
        Error loading achievement showcases: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Achievement Showcases</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Create Showcase
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Your Showcases</h3>
          <div className="space-y-4">
            {showcases.map((showcase) => (
              <ShowcaseCard
                key={showcase.id}
                showcase={showcase}
                onClick={() => setSelectedShowcase(showcase)}
                onLike={() => likeShowcase(showcase.id)}
                onUnlike={() => unlikeShowcase(showcase.id)}
                onDelete={() => deleteShowcase(showcase.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Popular Showcases</h3>
          <div className="space-y-4">
            {publicShowcases.map((showcase) => (
              <ShowcaseCard
                key={showcase.id}
                showcase={showcase}
                onClick={() => setSelectedShowcase(showcase)}
                onLike={() => likeShowcase(showcase.id)}
                onUnlike={() => unlikeShowcase(showcase.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateShowcaseModal
          themes={themes}
          onClose={() => setShowCreateModal(false)}
          onCreate={createShowcase}
        />
      )}

      {selectedShowcase && (
        <ShowcaseModal
          showcase={selectedShowcase}
          onClose={() => setSelectedShowcase(null)}
          onUpdate={updateShowcase}
          onAddAchievement={addAchievement}
          onUpdateAchievement={updateAchievement}
          onRemoveAchievement={removeAchievement}
        />
      )}
    </div>
  );
};

const ShowcaseCard: React.FC<{
  showcase: Showcase;
  onClick: () => void;
  onLike: () => void;
  onUnlike: () => void;
  onDelete?: () => void;
}> = ({ showcase, onClick, onLike, onUnlike, onDelete }) => {
  return (
    <div
      className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
      style={{
        backgroundColor: showcase.theme.backgroundColor,
        borderStyle: showcase.theme.borderStyle,
        fontFamily: showcase.theme.fontFamily,
        color: showcase.theme.primaryColor
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold">{showcase.title}</h4>
          <p className="text-sm" style={{ color: showcase.theme.secondaryColor }}>
            {showcase.description}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-500 hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {showcase.achievements.slice(0, 3).map((achievement) => (
          <div
            key={achievement.id}
            className="relative h-16 rounded overflow-hidden"
            style={{
              backgroundColor: achievement.customStyle?.backgroundColor || showcase.theme.backgroundColor,
              borderColor: achievement.customStyle?.borderColor || showcase.theme.accentColor,
              transform: `scale(${achievement.scale}) rotate(${achievement.rotation}deg)`
            }}
          >
            {achievement.customStyle?.glowEffect && (
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <span>
            {LAYOUT_OPTIONS[showcase.layout].icon} {LAYOUT_OPTIONS[showcase.layout].label}
          </span>
          <span>{showcase.achievements.length} achievements</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              showcase.liked ? onUnlike() : onLike();
            }}
            className="flex items-center space-x-1"
          >
            <span>{showcase.likes}</span>
            <span>{showcase.liked ? '❤️' : '🤍'}</span>
          </button>
          <span>👁️ {showcase.views}</span>
        </div>
      </div>
    </div>
  );
};

const CreateShowcaseModal: React.FC<{
  themes: ShowcaseTheme[];
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description: string;
    layout: Showcase['layout'];
    themeId: string;
    isPublic: boolean;
  }) => Promise<void>;
}> = ({ themes, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [layout, setLayout] = useState<Showcase['layout']>('grid');
  const [themeId, setThemeId] = useState(themes[0]?.id || '');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !themeId) return;

    setLoading(true);
    try {
      await onCreate({
        title,
        description,
        layout,
        themeId,
        isPublic
      });
      onClose();
    } catch (error) {
      console.error('Failed to create showcase:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Create Showcase</h3>
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
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              placeholder="My Awesome Achievements"
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
              placeholder="A collection of my greatest achievements"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Layout
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(LAYOUT_OPTIONS).map(([value, { label, icon }]) => (
                <button
                  key={value}
                  onClick={() => setLayout(value as Showcase['layout'])}
                  className={`p-2 rounded text-center ${
                    layout === value
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-sm">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setThemeId(theme.id)}
                  className={`p-3 rounded ${
                    themeId === theme.id
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                  style={{
                    backgroundColor: theme.backgroundColor,
                    borderStyle: theme.borderStyle,
                    color: theme.primaryColor
                  }}
                >
                  <div className="text-sm font-medium">{theme.name}</div>
                  <div
                    className="text-xs"
                    style={{ color: theme.secondaryColor }}
                  >
                    {Object.keys(theme.effects).join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPublic" className="text-gray-300">
              Make this showcase public
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
              disabled={loading || !title || !themeId}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Showcase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShowcaseModal: React.FC<{
  showcase: Showcase;
  onClose: () => void;
  onUpdate: (showcaseId: string, updates: Partial<Showcase>) => Promise<void>;
  onAddAchievement: (showcaseId: string, achievement: Omit<ShowcaseAchievement, 'id'>) => Promise<void>;
  onUpdateAchievement: (showcaseId: string, achievementId: string, updates: Partial<ShowcaseAchievement>) => Promise<void>;
  onRemoveAchievement: (showcaseId: string, achievementId: string) => Promise<void>;
}> = ({
  showcase,
  onClose,
  onUpdate,
  onAddAchievement,
  onUpdateAchievement,
  onRemoveAchievement
}) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(showcase.title);
  const [description, setDescription] = useState(showcase.description);
  const [layout, setLayout] = useState(showcase.layout);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(showcase.id, {
        title,
        description,
        layout
      });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update showcase:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: showcase.theme.backgroundColor,
          color: showcase.theme.primaryColor
        }}
      >
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
                rows={2}
              />
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold">{showcase.title}</h3>
              <p
                className="text-sm mt-1"
                style={{ color: showcase.theme.secondaryColor }}
              >
                {showcase.description}
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

        <div
          className={`grid gap-4 ${
            showcase.layout === 'grid'
              ? 'grid-cols-3'
              : showcase.layout === 'list'
              ? 'grid-cols-1'
              : 'grid-cols-1'
          }`}
        >
          {showcase.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="relative bg-gray-700 rounded-lg p-4"
              style={{
                backgroundColor: achievement.customStyle?.backgroundColor || showcase.theme.backgroundColor,
                borderColor: achievement.customStyle?.borderColor || showcase.theme.accentColor,
                transform: `scale(${achievement.scale}) rotate(${achievement.rotation}deg)`,
                transition: 'all 0.3s ease'
              }}
            >
              {achievement.customStyle?.glowEffect && (
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    backgroundColor: achievement.customStyle.borderColor || showcase.theme.accentColor,
                    opacity: 0.2,
                    filter: 'blur(8px)'
                  }}
                />
              )}
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{achievement.customDescription}</h4>
                  <button
                    onClick={() => onRemoveAchievement(showcase.id, achievement.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
                {achievement.customStyle?.animation && (
                  <div className="mt-2 text-sm" style={{ color: showcase.theme.secondaryColor }}>
                    {ANIMATION_OPTIONS[achievement.customStyle.animation as keyof typeof ANIMATION_OPTIONS]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
