import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateFixture, setShowCreateFixture] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const response = await axios.get(`${API}/calendar/events`, {
        params: { start_date: startDate, end_date: endDate }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFixtures = async () => {
    try {
      const response = await axios.get(`${API}/fixtures`);
      setFixtures(response.data);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchFixtures();
  }, [currentDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
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

  const getEventTypeIcon = (event) => {
    if (event.type === 'fixture') return '🏆';
    return '🎯';
  };

  const getEventTypeBadge = (event) => {
    if (event.type === 'fixture') return 'badge badge-fixture';
    const accuracy = event.accuracy || 0;
    if (accuracy >= 80) return 'badge badge-high';
    if (accuracy >= 60) return 'badge badge-medium';
    return 'badge badge-low';
  };

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Calendar Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shooting Calendar</h1>
          <button
            onClick={() => setShowCreateFixture(true)}
            className="btn-primary"
          >
            Create Fixture
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            ← Previous
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDate(day);

            return (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded-lg transition-colors ${
                  isCurrentMonth 
                    ? 'bg-white border-gray-200 hover:bg-gray-50' 
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                } ${isToday ? 'ring-2 ring-purple-300' : ''}`}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  isToday ? 'text-purple-600' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
                
                {dayEvents.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    onClick={() => setSelectedEvent(event)}
                    className="text-xs p-1 mb-1 rounded cursor-pointer hover:shadow-sm transition-shadow"
                    style={{
                      backgroundColor: event.type === 'fixture' ? '#e0e7ff' : '#f3e8ff',
                      color: event.type === 'fixture' ? '#3730a3' : '#6b21a8'
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{getEventTypeIcon(event)}</span>
                      <span className="truncate">{event.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="text-sm text-gray-600">Fixtures/Competitions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span className="text-sm text-gray-600">Practice Sessions</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Fixtures:</span>
              <span className="font-semibold">
                {fixtures.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">This Month's Events:</span>
              <span className="font-semibold">
                {events.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {getEventTypeIcon(selectedEvent)}
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">📅 Date:</span>
                <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">⏰ Time:</span>
                <span>{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">📍 Location:</span>
                <span>{selectedEvent.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">🎯 Discipline:</span>
                <span>{formatDiscipline(selectedEvent.discipline)}</span>
              </div>
              
              {selectedEvent.type === 'fixture' && (
                <>
                  {selectedEvent.description && (
                    <div>
                      <span className="text-gray-600">📋 Description:</span>
                      <p className="mt-1 text-sm">{selectedEvent.description}</p>
                    </div>
                  )}
                  {selectedEvent.organizer && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">👥 Organizer:</span>
                      <span>{selectedEvent.organizer}</span>
                    </div>
                  )}
                  {selectedEvent.entry_fee && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">💰 Entry Fee:</span>
                      <span>${selectedEvent.entry_fee}</span>
                    </div>
                  )}
                </>
              )}
              
              {selectedEvent.type === 'session' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">🎯 Score:</span>
                    <span>{selectedEvent.clays_hit}/{selectedEvent.total_clays}</span>
                    <span className={getEventTypeBadge(selectedEvent)}>
                      {selectedEvent.accuracy}%
                    </span>
                  </div>
                  {selectedEvent.fixture_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">🏆 Fixture:</span>
                      <span>{selectedEvent.fixture_name}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Fixture Modal - Placeholder */}
      {showCreateFixture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Create Fixture</h3>
              <p className="text-gray-600 mb-6">
                Fixture creation form will be implemented in the next phase.
              </p>
              <button
                onClick={() => setShowCreateFixture(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;