import React from 'react';
import AdSection, { sampleAds } from './AdSection';

const Dashboard = ({ sessions, stats }) => {
  const recentSessions = sessions.slice(0, 5);

  const getAccuracyBadge = (accuracy) => {
    if (accuracy >= 80) return 'badge badge-high';
    if (accuracy >= 60) return 'badge badge-medium';
    return 'badge badge-low';
  };

  const formatDiscipline = (discipline) => {
    const disciplineMap = {
      'trap': 'Trap',
      'skeet': 'Skeet',
      'sporting_clays': 'Sporting Clays',
      'down_the_line': 'Down the Line',
      'olympic_trap': 'Olympic Trap',
      'american_trap': 'American Trap'
    };
    return disciplineMap[discipline] || discipline;
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="hero-section">
        <img 
          src="https://images.unsplash.com/photo-1606401900698-8ab5e587ed77?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHx0cmFwJTIwc2hvb3Rpbmd8ZW58MHx8fHwxNzUzMTU3MDYyfDA&ixlib=rb-4.1.0&q=85"
          alt="Clay Pigeon Shooting - Outdoor Shooting Range"
          className="hero-image"
        />
        <h1 className="text-4xl font-bold mb-4">Welcome to Clay Tracker Australia</h1>
        <p className="text-xl opacity-90">
          Track your clay pigeon shooting performance and improve your skills
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats-card stats-card-total">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Sessions</p>
              <p className="text-3xl font-bold">{stats?.total_sessions || 0}</p>
            </div>
            <div className="text-4xl opacity-75">🎯</div>
          </div>
        </div>

        <div className="stats-card stats-card-accuracy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Overall Accuracy</p>
              <p className="text-3xl font-bold">{stats?.overall_accuracy || 0}%</p>
            </div>
            <div className="text-4xl opacity-75">📊</div>
          </div>
        </div>

        <div className="stats-card stats-card-best">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Best Session</p>
              <p className="text-3xl font-bold">{stats?.best_session_accuracy || 0}%</p>
            </div>
            <div className="text-4xl opacity-75">🏆</div>
          </div>
        </div>

        <div className="stats-card stats-card-streak">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Current Streak</p>
              <p className="text-3xl font-bold">{stats?.current_streak || 0}</p>
              <p className="text-xs opacity-75">sessions ≥80%</p>
            </div>
            <div className="text-4xl opacity-75">🔥</div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Sessions</h2>
          <a 
            href="/history" 
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            View All →
          </a>
        </div>

        {recentSessions.length > 0 ? (
          <div className="space-y-4">
            {recentSessions.map((session) => {
              const accuracy = session.total_clays > 0 
                ? Math.round((session.clays_hit / session.total_clays) * 100) 
                : 0;

              return (
                <div key={session.id} className="session-card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {formatDiscipline(session.discipline)}
                        </h3>
                        <span className={getAccuracyBadge(accuracy)}>
                          {accuracy}%
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm space-y-1">
                        <div className="flex items-center gap-4">
                          <span>📅 {new Date(session.date).toLocaleDateString()}</span>
                          <span>📍 {session.location}</span>
                          <span>🎯 {session.clays_hit}/{session.total_clays}</span>
                        </div>
                        {session.weather && (
                          <div className="flex items-center gap-2">
                            <span>🌤️ {session.weather}</span>
                            {session.temperature && (
                              <span>🌡️ {session.temperature}°</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No sessions recorded yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start tracking your clay pigeon shooting performance!
            </p>
            <a 
              href="/add-session"
              className="btn-primary inline-block"
            >
              Add Your First Session
            </a>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {stats && stats.total_sessions > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🏹</div>
            <div className="text-2xl font-bold text-gray-800">
              {stats.total_clays}
            </div>
            <div className="text-gray-600">Total Clays Thrown</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-gray-800">
              {stats.total_hits}
            </div>
            <div className="text-gray-600">Total Hits</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-gray-800">
              {formatDiscipline(stats.favorite_discipline)}
            </div>
            <div className="text-gray-600">Favorite Discipline</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;