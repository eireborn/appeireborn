import React, { useState } from 'react';

const SessionHistory = ({ sessions, onUpdateSession, onDeleteSession }) => {
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingSession, setEditingSession] = useState(null);

  const disciplineOptions = [
    { value: '', label: 'All Disciplines' },
    { value: 'trap', label: 'Trap' },
    { value: 'skeet', label: 'Skeet' },
    { value: 'sporting_clays', label: 'Sporting Clays' },
    { value: 'down_the_line', label: 'Down the Line' },
    { value: 'olympic_trap', label: 'Olympic Trap' },
    { value: 'american_trap', label: 'American Trap' }
  ];

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

  const getAccuracyBadge = (accuracy) => {
    if (accuracy >= 80) return 'badge badge-high';
    if (accuracy >= 60) return 'badge badge-medium';
    return 'badge badge-low';
  };

  const filteredAndSortedSessions = sessions
    .filter(session => !filterDiscipline || session.discipline === filterDiscipline)
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'accuracy') {
        aValue = a.total_clays > 0 ? (a.clays_hit / a.total_clays) * 100 : 0;
        bValue = b.total_clays > 0 ? (b.clays_hit / b.total_clays) * 100 : 0;
      } else if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await onDeleteSession(sessionId);
      } catch (error) {
        alert('Error deleting session. Please try again.');
      }
    }
  };

  const handleEdit = (session) => {
    setEditingSession({
      ...session,
      date: typeof session.date === 'string' ? session.date : session.date.toISOString().split('T')[0]
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await onUpdateSession(editingSession.id, editingSession);
      setEditingSession(null);
    } catch (error) {
      alert('Error updating session. Please try again.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingSession(prev => ({
      ...prev,
      [name]: name === 'total_clays' || name === 'clays_hit' || name === 'temperature' 
        ? (value ? parseInt(value) : '') 
        : value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Session History</h1>
            <p className="text-gray-600">View and manage all your shooting sessions</p>
          </div>
          <div className="text-4xl">📝</div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="min-w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Discipline
            </label>
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="form-select"
            >
              {disciplineOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-36">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              <option value="date">Date</option>
              <option value="accuracy">Accuracy</option>
              <option value="location">Location</option>
              <option value="discipline">Discipline</option>
            </select>
          </div>

          <div className="min-w-32">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Sessions List */}
        {filteredAndSortedSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedSessions.map((session) => {
              const accuracy = session.total_clays > 0 
                ? Math.round((session.clays_hit / session.total_clays) * 100) 
                : 0;

              return (
                <div key={session.id} className="session-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {formatDiscipline(session.discipline)}
                        </h3>
                        <span className={getAccuracyBadge(accuracy)}>
                          {accuracy}%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{new Date(session.date).toLocaleDateString()} at {session.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🎯</span>
                          <span>{session.clays_hit}/{session.total_clays} clays</span>
                        </div>

                        {session.weather && (
                          <div className="flex items-center gap-2">
                            <span>🌤️</span>
                            <span>{session.weather}</span>
                          </div>
                        )}

                        {session.temperature && (
                          <div className="flex items-center gap-2">
                            <span>🌡️</span>
                            <span>{session.temperature}°C</span>
                          </div>
                        )}

                        {session.gun_used && (
                          <div className="flex items-center gap-2">
                            <span>🔫</span>
                            <span>{session.gun_used}</span>
                          </div>
                        )}
                      </div>

                      {session.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">{session.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(session)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No sessions found
            </h3>
            <p className="text-gray-500">
              {filterDiscipline 
                ? `No sessions found for ${formatDiscipline(filterDiscipline)}`
                : 'No shooting sessions recorded yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Session</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={editingSession.date}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={editingSession.time}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editingSession.location}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discipline
                  </label>
                  <select
                    name="discipline"
                    value={editingSession.discipline}
                    onChange={handleEditChange}
                    className="form-select"
                    required
                  >
                    {disciplineOptions.slice(1).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Clays
                  </label>
                  <input
                    type="number"
                    name="total_clays"
                    value={editingSession.total_clays}
                    onChange={handleEditChange}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Clays Hit
                  </label>
                  <input
                    type="number"
                    name="clays_hit"
                    value={editingSession.clays_hit}
                    onChange={handleEditChange}
                    className="form-input"
                    min="0"
                    max={editingSession.total_clays || 100}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={editingSession.notes || ''}
                  onChange={handleEditChange}
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;