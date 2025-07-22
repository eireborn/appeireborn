import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateFixture = ({ isOpen, onClose, onFixtureCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    discipline: 'trap',
    max_participants: '',
    entry_fee: '',
    organizer: '',
    contact_info: '',
    notes: ''
  });

  const disciplineOptions = [
    { value: 'trap', label: 'Trap' },
    { value: 'skeet', label: 'Skeet' },
    { value: 'sporting_clays', label: 'Sporting Clays' },
    { value: 'down_the_line', label: 'Down the Line' },
    { value: 'olympic_trap', label: 'Olympic Trap' },
    { value: 'american_trap', label: 'American Trap' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      alert('Please fill in the fixture name and location');
      return;
    }

    setLoading(true);

    try {
      const fixtureData = {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee) : null,
        description: formData.description || null,
        organizer: formData.organizer || null,
        contact_info: formData.contact_info || null,
        notes: formData.notes || null
      };

      const response = await axios.post(`${API}/fixtures`, fixtureData);
      
      if (response.status === 200) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          location: '',
          discipline: 'trap',
          max_participants: '',
          entry_fee: '',
          organizer: '',
          contact_info: '',
          notes: ''
        });
        
        onFixtureCreated && onFixtureCreated(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating fixture:', error);
      alert('Error creating fixture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Create New Fixture</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fixture Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fixture Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Spring Championship"
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discipline *
              </label>
              <select
                name="discipline"
                value={formData.discipline}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {disciplineOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the fixture..."
              className="form-input"
              rows="3"
            />
          </div>

          {/* Date, Time, Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., National Shooting Centre"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Competition Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Competition Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
                  className="form-input"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Entry Fee ($)
                </label>
                <input
                  type="number"
                  name="entry_fee"
                  value={formData.entry_fee}
                  onChange={handleInputChange}
                  placeholder="e.g., 25.00"
                  className="form-input"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Organization Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Organization Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organizer
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  placeholder="e.g., National Clay Shooting Association"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Info
                </label>
                <input
                  type="text"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleInputChange}
                  placeholder="e.g., info@ncsa.org or (555) 123-4567"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional information, rules, or requirements..."
              className="form-input"
              rows="3"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Fixture'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFixture;