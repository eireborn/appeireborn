import React, { useMemo } from 'react';

const Statistics = ({ sessions, stats }) => {
  const chartData = useMemo(() => {
    // Group sessions by date for performance chart
    const sessionsByDate = sessions.reduce((acc, session) => {
      const date = new Date(session.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { totalClays: 0, hits: 0, sessions: 0 };
      }
      acc[date].totalClays += session.total_clays;
      acc[date].hits += session.clays_hit;
      acc[date].sessions += 1;
      return acc;
    }, {});

    const performanceData = Object.entries(sessionsByDate)
      .map(([date, data]) => ({
        date,
        accuracy: data.totalClays > 0 ? (data.hits / data.totalClays) * 100 : 0,
        sessions: data.sessions
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10); // Last 10 sessions

    // Group by discipline
    const disciplineStats = sessions.reduce((acc, session) => {
      if (!acc[session.discipline]) {
        acc[session.discipline] = { sessions: 0, totalClays: 0, hits: 0 };
      }
      acc[session.discipline].sessions += 1;
      acc[session.discipline].totalClays += session.total_clays;
      acc[session.discipline].hits += session.clays_hit;
      return acc;
    }, {});

    return { performanceData, disciplineStats };
  }, [sessions]);

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

  const getPerformanceTrend = () => {
    if (chartData.performanceData.length < 2) return 'neutral';
    const recent = chartData.performanceData.slice(-3);
    const older = chartData.performanceData.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((sum, item) => sum + item.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.accuracy, 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  };

  const performanceTrend = getPerformanceTrend();

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">📈 Performance Statistics</h1>
        <p className="text-gray-600 text-lg">Analyze your clay pigeon shooting progress</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Statistics Available
          </h3>
          <p className="text-gray-500 mb-6">
            Record some shooting sessions to see your performance statistics
          </p>
          <a href="/add-session" className="btn-primary">
            Add Your First Session
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stats-card stats-card-total">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-3xl font-bold mb-1">{stats?.total_sessions || 0}</div>
                <div className="text-sm opacity-90">Total Sessions</div>
              </div>
            </div>

            <div className="stats-card stats-card-accuracy">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-3xl font-bold mb-1">{stats?.overall_accuracy || 0}%</div>
                <div className="text-sm opacity-90">Overall Accuracy</div>
              </div>
            </div>

            <div className="stats-card stats-card-best">
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-3xl font-bold mb-1">{stats?.best_session_accuracy || 0}%</div>
                <div className="text-sm opacity-90">Best Session</div>
              </div>
            </div>

            <div className="stats-card stats-card-streak">
              <div className="text-center">
                <div className="text-3xl mb-2">{getTrendIcon(performanceTrend)}</div>
                <div className={`text-lg font-bold mb-1 ${getTrendColor(performanceTrend)}`}>
                  {performanceTrend.toUpperCase()}
                </div>
                <div className="text-sm opacity-90">Recent Trend</div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Over Time</h2>
            
            {chartData.performanceData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64 flex items-end justify-between bg-gray-50 rounded-xl p-4">
                  {chartData.performanceData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 max-w-16">
                      <div 
                        className="bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg w-8 mb-2 transition-all hover:from-purple-600 hover:to-purple-400"
                        style={{ height: `${Math.max(data.accuracy * 2, 8)}px` }}
                        title={`${data.accuracy.toFixed(1)}% accuracy`}
                      ></div>
                      <div className="text-xs text-gray-600 text-center">
                        {new Date(data.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-purple-600 font-semibold">
                        {data.accuracy.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-500">
                  Last {chartData.performanceData.length} shooting sessions
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Not enough sessions for chart display
              </div>
            )}
          </div>

          {/* Discipline Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance by Discipline</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(chartData.disciplineStats).map(([discipline, data]) => {
                const accuracy = data.totalClays > 0 ? (data.hits / data.totalClays) * 100 : 0;
                
                return (
                  <div key={discipline} className="session-card">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {formatDiscipline(discipline)}
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {accuracy.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-semibold text-gray-800">{data.sessions}</div>
                            <div className="text-gray-600">Sessions</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {data.hits}/{data.totalClays}
                            </div>
                            <div className="text-gray-600">Hits/Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Performance Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">🎯 Accuracy Insights</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Overall accuracy: {stats?.overall_accuracy || 0}%</li>
                  <li>• Best session: {stats?.best_session_accuracy || 0}%</li>
                  <li>• Current streak: {stats?.current_streak || 0} sessions ≥80%</li>
                  <li>• Performance trend: {performanceTrend}</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">📈 Activity Summary</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Total sessions: {stats?.total_sessions || 0}</li>
                  <li>• Total clays thrown: {stats?.total_clays || 0}</li>
                  <li>• Total hits: {stats?.total_hits || 0}</li>
                  <li>• Favorite discipline: {formatDiscipline(stats?.favorite_discipline || '')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;