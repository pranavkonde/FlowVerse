import React, { useState, useEffect } from 'react';
import { useStatistics } from '../../hooks/useStatistics';
import { PlayerStatistics, ActivitySummary, PerformanceMetrics, AchievementProgress } from '../../types/statistics';
import './StatisticsDashboard.css';

interface StatisticsDashboardProps {
  playerId: string;
  onClose: () => void;
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ playerId, onClose }) => {
  const { 
    statistics, 
    activitySummary, 
    performanceMetrics, 
    achievementProgress, 
    loading, 
    error,
    fetchStatistics,
    fetchActivitySummary,
    fetchPerformanceMetrics,
    fetchAchievementProgress
  } = useStatistics(playerId);

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'performance' | 'achievements'>('overview');
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchStatistics(timeframe);
    fetchActivitySummary(30);
    fetchPerformanceMetrics();
    fetchAchievementProgress();
  }, [playerId, timeframe]);

  if (loading) {
    return (
      <div className="statistics-dashboard">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-dashboard">
        <div className="error">Error loading statistics: {error}</div>
      </div>
    );
  }

  return (
    <div className="statistics-dashboard">
      <div className="dashboard-header">
        <h2>Player Statistics</h2>
        <div className="header-controls">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-selector"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
            <option value="day">Today</option>
          </select>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button 
          className={activeTab === 'performance' ? 'active' : ''}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button 
          className={activeTab === 'achievements' ? 'active' : ''}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && statistics && (
          <OverviewTab statistics={statistics} />
        )}
        {activeTab === 'activity' && activitySummary && (
          <ActivityTab activitySummary={activitySummary} />
        )}
        {activeTab === 'performance' && performanceMetrics && (
          <PerformanceTab performanceMetrics={performanceMetrics} />
        )}
        {activeTab === 'achievements' && achievementProgress && (
          <AchievementsTab achievementProgress={achievementProgress} />
        )}
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ statistics: PlayerStatistics }> = ({ statistics }) => {
  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Level & Experience</h3>
          <div className="stat-value">{statistics.overview.level}</div>
          <div className="stat-label">Level</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(statistics.overview.experience % 1000) / 10}%` }}
            />
          </div>
          <div className="stat-detail">{statistics.overview.experience} XP</div>
        </div>

        <div className="stat-card">
          <h3>Play Time</h3>
          <div className="stat-value">{statistics.overview.totalPlayTime}h</div>
          <div className="stat-label">Total Play Time</div>
          <div className="stat-detail">
            {statistics.activity.averageSessionTime}min avg session
          </div>
        </div>

        <div className="stat-card">
          <h3>Achievements</h3>
          <div className="stat-value">{statistics.overview.achievements}</div>
          <div className="stat-label">Unlocked</div>
          <div className="stat-detail">Keep going!</div>
        </div>

        <div className="stat-card">
          <h3>Performance</h3>
          <div className="stat-value">{Math.round(statistics.performance.winRate * 100)}%</div>
          <div className="stat-label">Win Rate</div>
          <div className="stat-detail">
            {statistics.performance.gamesWon}/{statistics.performance.gamesPlayed} games
          </div>
        </div>

        <div className="stat-card">
          <h3>Social</h3>
          <div className="stat-value">{statistics.social.friendsCount}</div>
          <div className="stat-label">Friends</div>
          <div className="stat-detail">{statistics.social.guildMembership}</div>
        </div>

        <div className="stat-card">
          <h3>Progression</h3>
          <div className="stat-value">{statistics.progression.questsCompleted}</div>
          <div className="stat-label">Quests Completed</div>
          <div className="stat-detail">{statistics.progression.areasExplored} areas explored</div>
        </div>
      </div>
    </div>
  );
};

const ActivityTab: React.FC<{ activitySummary: ActivitySummary }> = ({ activitySummary }) => {
  return (
    <div className="activity-tab">
      <div className="activity-summary">
        <div className="summary-card">
          <h3>Activity Streak</h3>
          <div className="stat-value">{activitySummary.streak}</div>
          <div className="stat-label">Days</div>
        </div>
        <div className="summary-card">
          <h3>Most Active Day</h3>
          <div className="stat-value">{activitySummary.mostActiveDay}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="summary-card">
          <h3>Total Play Time</h3>
          <div className="stat-value">{activitySummary.totalPlayTime}h</div>
          <div className="stat-label">Last {activitySummary.period}</div>
        </div>
      </div>

      <div className="activity-chart">
        <h3>Daily Activity</h3>
        <div className="chart-container">
          {activitySummary.dailyActivity.map((day, index) => (
            <div key={index} className="chart-bar">
              <div 
                className="bar-fill" 
                style={{ height: `${(day.playTime / 8) * 100}%` }}
              />
              <div className="bar-label">{day.playTime}h</div>
              <div className="bar-date">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PerformanceTab: React.FC<{ performanceMetrics: PerformanceMetrics }> = ({ performanceMetrics }) => {
  return (
    <div className="performance-tab">
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Accuracy</h3>
          <div className="metric-value">{Math.round(performanceMetrics.metrics.accuracy * 100)}%</div>
          <div className="metric-bar">
            <div 
              className="metric-fill" 
              style={{ width: `${performanceMetrics.metrics.accuracy * 100}%` }}
            />
          </div>
        </div>

        <div className="metric-card">
          <h3>Speed</h3>
          <div className="metric-value">{performanceMetrics.metrics.speed}</div>
          <div className="metric-label">Actions/Min</div>
        </div>

        <div className="metric-card">
          <h3>Efficiency</h3>
          <div className="metric-value">{Math.round(performanceMetrics.metrics.efficiency * 100)}%</div>
          <div className="metric-bar">
            <div 
              className="metric-fill" 
              style={{ width: `${performanceMetrics.metrics.efficiency * 100}%` }}
            />
          </div>
        </div>

        <div className="metric-card">
          <h3>Consistency</h3>
          <div className="metric-value">{Math.round(performanceMetrics.metrics.consistency * 100)}%</div>
          <div className="metric-bar">
            <div 
              className="metric-fill" 
              style={{ width: `${performanceMetrics.metrics.consistency * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rankings-section">
        <h3>Rankings</h3>
        <div className="rankings-grid">
          <div className="ranking-item">
            <span className="ranking-label">Global</span>
            <span className="ranking-value">#{performanceMetrics.rankings.global}</span>
          </div>
          <div className="ranking-item">
            <span className="ranking-label">Regional</span>
            <span className="ranking-value">#{performanceMetrics.rankings.regional}</span>
          </div>
          <div className="ranking-item">
            <span className="ranking-label">Friends</span>
            <span className="ranking-value">#{performanceMetrics.rankings.friends}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AchievementsTab: React.FC<{ achievementProgress: AchievementProgress }> = ({ achievementProgress }) => {
  const progressPercentage = (achievementProgress.unlocked / achievementProgress.totalAchievements) * 100;

  return (
    <div className="achievements-tab">
      <div className="achievement-overview">
        <div className="progress-circle">
          <div className="circle-fill" style={{ 
            background: `conic-gradient(#4CAF50 ${progressPercentage * 3.6}deg, #e0e0e0 0deg)` 
          }}>
            <div className="circle-inner">
              <div className="progress-text">{achievementProgress.unlocked}</div>
              <div className="progress-total">/{achievementProgress.totalAchievements}</div>
            </div>
          </div>
        </div>
        <div className="achievement-stats">
          <div className="stat-item">
            <span className="stat-number">{achievementProgress.unlocked}</span>
            <span className="stat-text">Unlocked</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{achievementProgress.inProgress}</span>
            <span className="stat-text">In Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{achievementProgress.locked}</span>
            <span className="stat-text">Locked</span>
          </div>
        </div>
      </div>

      <div className="achievement-categories">
        <h3>Categories</h3>
        <div className="categories-grid">
          {Object.entries(achievementProgress.categories).map(([category, data]) => (
            <div key={category} className="category-card">
              <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
              <div className="category-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(data.unlocked / data.total) * 100}%` }}
                  />
                </div>
                <span className="progress-text">{data.unlocked}/{data.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-achievements">
        <h3>Recent Unlocks</h3>
        <div className="achievement-list">
          {achievementProgress.recentUnlocks.map((achievement) => (
            <div key={achievement.id} className="achievement-item">
              <div className="achievement-icon">🏆</div>
              <div className="achievement-info">
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-date">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
