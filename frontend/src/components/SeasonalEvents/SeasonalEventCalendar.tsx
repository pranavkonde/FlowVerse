import React from 'react';
import { useSeasonalEvents } from '../../hooks/useSeasonalEvents';
import { SeasonalEvent, EventProgress } from '../../types/seasonalEvents';

const SEASON_COLORS = {
  SPRING: 'bg-green-500',
  SUMMER: 'bg-yellow-500',
  FALL: 'bg-orange-500',
  WINTER: 'bg-blue-500'
};

const EVENT_TYPE_ICONS = {
  FESTIVAL: '🎉',
  TOURNAMENT: '⚔️',
  QUEST_CHAIN: '📜',
  COMMUNITY_CHALLENGE: '👥',
  SPECIAL_BOSS: '👑',
  TREASURE_HUNT: '💎',
  CRAFTING_EVENT: '⚒️',
  PVP_EVENT: '🏹',
  EXPLORATION_EVENT: '🗺️',
  SOCIAL_EVENT: '🤝'
};

export function SeasonalEventCalendar() {
  const {
    calendar,
    loading,
    error,
    joinEvent,
    updateProgress,
    claimReward
  } = useSeasonalEvents();

  if (loading) {
    return <div className="p-4">Loading seasonal events...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!calendar) {
    return <div className="p-4">No event calendar available</div>;
  }

  const renderProgress = (event: SeasonalEvent) => {
    const progress = calendar.userProgress[event.id];
    if (!progress) return null;

    return (
      <div className="space-y-2">
        {progress.requirements.map((req, index) => (
          <div key={index} className="text-sm">
            <div className="flex justify-between text-gray-300">
              <span>{req.type}</span>
              <span>
                {req.current} / {req.required}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div
                className="bg-blue-500 rounded-full h-1"
                style={{
                  width: `${(req.current / req.required) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRewards = (event: SeasonalEvent, progress?: EventProgress) => (
    <div className="space-y-1">
      {event.rewards.map((reward, index) => (
        <div
          key={index}
          className="flex justify-between items-center text-sm"
        >
          <span className="text-gray-300">
            {reward.amount}x {reward.description}
          </span>
          {progress?.rewardsClaimed[index] ? (
            <span className="text-green-500">Claimed</span>
          ) : progress?.requirements.every(
            req => req.current >= req.required
          ) ? (
            <button
              onClick={() => claimReward(event.id, index)}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              Claim
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );

  const renderEvent = (event: SeasonalEvent) => (
    <div
      key={event.id}
      className="bg-gray-700 rounded-lg overflow-hidden"
    >
      <div className={`${SEASON_COLORS[event.season]} p-2`}>
        <div className="flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center">
            <span className="mr-2">{EVENT_TYPE_ICONS[event.type]}</span>
            {event.title}
          </h3>
          <span className="text-sm text-white opacity-75">
            {new Date(event.startDate).toLocaleDateString()} -{' '}
            {new Date(event.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-gray-300">{event.description}</p>

        {calendar.userProgress[event.id] ? (
          <>
            {renderProgress(event)}
            <div className="border-t border-gray-600 pt-2">
              {renderRewards(event, calendar.userProgress[event.id])}
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-400">
              <div>Requirements:</div>
              <ul className="list-disc list-inside">
                {event.requirements.map((req, index) => (
                  <li key={index}>
                    {req.description} ({req.value})
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => joinEvent(event.id)}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Join Event
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {calendar.currentSeason} Season
          </h2>
          <div className="text-right">
            <div className="text-xl font-bold text-white">
              {calendar.seasonProgress}%
            </div>
            <div className="text-sm text-gray-400">Season Progress</div>
          </div>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`${
              SEASON_COLORS[calendar.currentSeason]
            } rounded-full h-2`}
            style={{ width: `${calendar.seasonProgress}%` }}
          />
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Season Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {calendar.seasonRewards.map((reward, index) => (
              <div
                key={index}
                className="bg-gray-700 rounded p-2 text-gray-300"
              >
                {reward.description}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {calendar.activeEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Active Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calendar.activeEvents.map(renderEvent)}
            </div>
          </div>
        )}

        {calendar.upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calendar.upcomingEvents.map(renderEvent)}
            </div>
          </div>
        )}

        {calendar.completedEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Completed Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calendar.completedEvents.map(renderEvent)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}