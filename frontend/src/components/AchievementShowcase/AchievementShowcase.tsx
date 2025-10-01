import React, { useState } from 'react';
import { useAchievementShowcase } from '../../hooks/useAchievementShowcase';
import {
  AchievementShowcase as ShowcaseType,
  ShowcaseAchievement,
  ShowcaseFilter,
  AchievementRarity,
  ShowcaseLayout,
  ShowcaseTheme
} from '../../types/achievementShowcase';

const RARITY_COLORS = {
  COMMON: 'bg-gray-500',
  UNCOMMON: 'bg-green-500',
  RARE: 'bg-blue-500',
  EPIC: 'bg-purple-500',
  LEGENDARY: 'bg-yellow-500',
  MYTHIC: 'bg-red-500'
};

const THEME_STYLES = {
  DEFAULT: 'bg-gray-800',
  DARK: 'bg-black',
  LIGHT: 'bg-white text-gray-900',
  NEON: 'bg-gray-900 text-neon-blue',
  RETRO: 'bg-sepia',
  NATURE: 'bg-green-900',
  SPACE: 'bg-indigo-900'
};

export function AchievementShowcase() {
  const {
    userShowcases,
    publicShowcases,
    stats,
    loading,
    error,
    createShowcase,
    updateShowcase,
    addAchievement,
    removeAchievement,
    updateAchievementPosition,
    likeShowcase,
    addComment,
    getComments,
    filterPublicShowcases
  } = useAchievementShowcase();

  const [selectedShowcase, setSelectedShowcase] = useState<ShowcaseType | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<ShowcaseFilter>({
    sortBy: 'recent'
  });

  if (loading) {
    return <div className="p-4">Loading achievement showcases...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const handleCreateShowcase = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    try {
      const showcase = await createShowcase({
        title: data.get('title') as string,
        description: data.get('description') as string,
        layout: data.get('layout') as ShowcaseLayout,
        theme: data.get('theme') as ShowcaseTheme,
        visibility: data.get('visibility') as 'PUBLIC' | 'FRIENDS' | 'PRIVATE'
      });
      setShowCreateForm(false);
      setSelectedShowcase(showcase);
    } catch (err) {
      console.error('Error creating showcase:', err);
    }
  };

  const handleDragAchievement = (
    event: React.DragEvent,
    showcase: ShowcaseType,
    achievement: ShowcaseAchievement
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    updateAchievementPosition(
      showcase.id,
      achievement.id,
      { x, y }
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Your Showcase Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalShowcases}
            </div>
            <div className="text-sm text-gray-400">Total Showcases</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalAchievements}
            </div>
            <div className="text-sm text-gray-400">Total Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalViews}
            </div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalLikes}
            </div>
            <div className="text-sm text-gray-400">Total Likes</div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateForm = () => (
    <form
      onSubmit={handleCreateShowcase}
      className="bg-gray-800 rounded-lg p-4 mb-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">Create New Showcase</h2>
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
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            name="description"
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Layout</label>
            <select
              name="layout"
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            >
              <option value="GRID">Grid</option>
              <option value="MASONRY">Masonry</option>
              <option value="TIMELINE">Timeline</option>
              <option value="CAROUSEL">Carousel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Theme</label>
            <select
              name="theme"
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            >
              <option value="DEFAULT">Default</option>
              <option value="DARK">Dark</option>
              <option value="LIGHT">Light</option>
              <option value="NEON">Neon</option>
              <option value="RETRO">Retro</option>
              <option value="NATURE">Nature</option>
              <option value="SPACE">Space</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Visibility</label>
          <select
            name="visibility"
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="PUBLIC">Public</option>
            <option value="FRIENDS">Friends Only</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Showcase
          </button>
        </div>
      </div>
    </form>
  );

  const renderAchievement = (achievement: ShowcaseAchievement) => (
    <div
      key={achievement.id}
      className={`
        ${RARITY_COLORS[achievement.rarity]}
        rounded-lg overflow-hidden shadow-lg
        transform transition-transform duration-200
        hover:scale-105 cursor-move
      `}
      draggable
      style={{
        position: 'absolute',
        left: achievement.position.x,
        top: achievement.position.y,
        transform: `scale(${achievement.scale || 1}) rotate(${achievement.rotation || 0}deg)`
      }}
    >
      <img
        src={achievement.icon}
        alt={achievement.name}
        className="w-16 h-16 object-cover"
      />
      <div className="p-2">
        <h3 className="text-white font-semibold text-sm">{achievement.name}</h3>
        <p className="text-white text-xs opacity-75">{achievement.description}</p>
      </div>
    </div>
  );

  const renderShowcase = (showcase: ShowcaseType) => (
    <div
      key={showcase.id}
      className={`
        ${THEME_STYLES[showcase.theme]}
        rounded-lg overflow-hidden mb-4
      `}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{showcase.title}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-gray-400">
              <span className="mr-2">👁 {showcase.views}</span>
              <span>❤️ {showcase.likes}</span>
            </div>
            <button
              onClick={() => likeShowcase(showcase.id)}
              className="text-red-500 hover:text-red-400"
            >
              ❤️
            </button>
          </div>
        </div>

        <p className="text-gray-300 mb-4">{showcase.description}</p>

        <div
          className="relative min-h-[400px] border border-gray-700 rounded"
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDragAchievement(e, showcase, selectedShowcase!)}
        >
          {showcase.achievements.map(renderAchievement)}
        </div>
      </div>
    </div>
  );

  const renderFilter = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Filter Showcases</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Sort By</label>
          <select
            value={filter.sortBy}
            onChange={e => {
              const newFilter = { ...filter, sortBy: e.target.value as 'recent' | 'popular' | 'likes' | 'views' };
              setFilter(newFilter);
              filterPublicShowcases(newFilter);
            }}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="likes">Most Liked</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Layout</label>
          <select
            value={filter.layout}
            onChange={e => {
              const newFilter = { ...filter, layout: e.target.value as ShowcaseLayout };
              setFilter(newFilter);
              filterPublicShowcases(newFilter);
            }}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="">All Layouts</option>
            <option value="GRID">Grid</option>
            <option value="MASONRY">Masonry</option>
            <option value="TIMELINE">Timeline</option>
            <option value="CAROUSEL">Carousel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Theme</label>
          <select
            value={filter.theme}
            onChange={e => {
              const newFilter = { ...filter, theme: e.target.value as ShowcaseTheme };
              setFilter(newFilter);
              filterPublicShowcases(newFilter);
            }}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="">All Themes</option>
            <option value="DEFAULT">Default</option>
            <option value="DARK">Dark</option>
            <option value="LIGHT">Light</option>
            <option value="NEON">Neon</option>
            <option value="RETRO">Retro</option>
            <option value="NATURE">Nature</option>
            <option value="SPACE">Space</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Featured</label>
          <select
            value={filter.featured?.toString()}
            onChange={e => {
              const newFilter = { ...filter, featured: e.target.value === 'true' };
              setFilter(newFilter);
              filterPublicShowcases(newFilter);
            }}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="">All Showcases</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured Only</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {renderStats()}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Achievement Showcases</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showCreateForm ? 'Cancel' : 'Create New Showcase'}
        </button>
      </div>

      {showCreateForm && renderCreateForm()}

      {renderFilter()}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Your Showcases</h2>
          {userShowcases.map(renderShowcase)}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Public Showcases</h2>
          {publicShowcases.map(renderShowcase)}
        </div>
      </div>
    </div>
  );
}