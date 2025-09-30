import React, { useState } from 'react';
import { Season, SeasonalEvent, THEME_COLORS, DIFFICULTY_COLORS, EVENT_TYPE_LABELS } from '../../types/seasonalEvents';
import { useSeasonalEvents } from '../../hooks/useSeasonalEvents';

export const SeasonalEventCalendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<SeasonalEvent | null>(null);
  const { currentSeason, upcomingSeasons, loading, error, joinEvent } = useSeasonalEvents();

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
        Error loading seasonal events: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {currentSeason && (
        <CurrentSeason
          season={currentSeason}
          onEventSelect={setSelectedEvent}
        />
      )}

      {upcomingSeasons.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Upcoming Seasons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSeasons.map(season => (
              <SeasonCard
                key={season.id}
                season={season}
                isUpcoming
              />
            ))}
          </div>
        </div>
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onJoin={joinEvent}
        />
      )}
    </div>
  );
};

const CurrentSeason: React.FC<{
  season: Season;
  onEventSelect: (event: SeasonalEvent) => void;
}> = ({ season, onEventSelect }) => {
  const themeColors = THEME_COLORS[season.theme as keyof typeof THEME_COLORS] || THEME_COLORS.spring;
  
  return (
    <div>
      <div
        className="relative h-64 rounded-lg overflow-hidden mb-6"
        style={{
          background: `linear-gradient(135deg, ${themeColors.join(', ')})`
        }}
      >
        <img
          src={season.metadata.bannerUrl}
          alt={season.name}
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 p-6 flex flex-col justify-end">
          <h2 className="text-3xl font-bold text-white mb-2">{season.name}</h2>
          <p className="text-gray-200">{season.description}</p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-white">
              {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
            </span>
            <span className="px-3 py-1 bg-primary rounded-full text-white text-sm">
              {season.status.charAt(0).toUpperCase() + season.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Current Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {season.events
            .filter(event => event.status === 'active')
            .map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventSelect(event)}
              />
            ))}
        </div>

        <h3 className="text-xl font-semibold text-white mt-8">Upcoming Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {season.events
            .filter(event => event.status === 'upcoming')
            .map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventSelect(event)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

const SeasonCard: React.FC<{
  season: Season;
  isUpcoming?: boolean;
}> = ({ season, isUpcoming }) => {
  const themeColors = THEME_COLORS[season.theme as keyof typeof THEME_COLORS] || THEME_COLORS.spring;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${themeColors.join(', ')})`
      }}
    >
      <div className="relative h-48">
        <img
          src={season.metadata.bannerUrl}
          alt={season.name}
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 p-4 flex flex-col justify-end">
          <h3 className="text-xl font-semibold text-white">{season.name}</h3>
          <p className="text-sm text-gray-200 mt-2">{season.description}</p>
          <div className="mt-4">
            <span className="text-sm text-white">
              Starts {new Date(season.startDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventCard: React.FC<{
  event: SeasonalEvent;
  onClick: () => void;
}> = ({ event, onClick }) => {
  const difficultyColor = DIFFICULTY_COLORS[event.metadata.difficulty];
  
  return (
    <div
      onClick={onClick}
      className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-white">{event.name}</h4>
        <span className={`px-2 py-1 rounded text-sm bg-${difficultyColor}-500 text-white`}>
          {event.metadata.difficulty}
        </span>
      </div>

      <p className="text-gray-300 text-sm mb-4">{event.description}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Type:</span>
          <span className="text-white">{EVENT_TYPE_LABELS[event.type]}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Location:</span>
          <span className="text-white">{event.metadata.location}</span>
        </div>
        {event.metadata.maxParticipants && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Participants:</span>
            <span className="text-white">
              {event.participants.length} / {event.metadata.maxParticipants}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="text-sm font-semibold text-white mb-2">Objectives:</div>
        <div className="space-y-2">
          {event.objectives.map((objective, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-1">
                <div className="h-2 bg-gray-600 rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full transition-all duration-300"
                    style={{
                      width: `${(objective.current / objective.target) * 100}%`
                    }}
                  />
                </div>
              </div>
              <span className="ml-2 text-sm text-gray-300">
                {objective.current}/{objective.target}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EventModal: React.FC<{
  event: SeasonalEvent;
  onClose: () => void;
  onJoin: (eventId: string) => Promise<void>;
}> = ({ event, onClose, onJoin }) => {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await onJoin(event.id);
      onClose();
    } catch (error) {
      console.error('Failed to join event:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-white">{event.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-gray-300">{event.description}</p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{EVENT_TYPE_LABELS[event.type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">{event.metadata.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className="text-white">{event.metadata.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Team Event:</span>
                  <span className="text-white">{event.metadata.teamEvent ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Requirements</h4>
              <div className="space-y-2">
                {event.requirements.minLevel && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Level:</span>
                    <span className="text-white">{event.requirements.minLevel}</span>
                  </div>
                )}
                {event.requirements.items && event.requirements.items.length > 0 && (
                  <div>
                    <span className="text-gray-400">Required Items:</span>
                    <ul className="mt-1 space-y-1">
                      {event.requirements.items.map((item, index) => (
                        <li key={index} className="text-white">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Rewards</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.rewards.map((reward, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded p-3 flex items-center space-x-3"
                >
                  <img
                    src={reward.metadata.imageUrl}
                    alt={reward.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div className="text-white font-medium">{reward.name}</div>
                    <div className="text-sm text-gray-400">x{reward.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleJoin}
              disabled={isJoining || event.status !== 'active'}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
