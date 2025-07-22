import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AddSession = ({ onAddSession }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fixtures, setFixtures] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    location: '',
    discipline: 'trap',
    total_clays: '',
    clays_hit: '',
    weather: '',
    temperature: '',
    wind_speed: '',
    gun_used: '',
    cartridge_type: '',
    choke_used: '',
    notes: '',
    fixture_id: '',
    fixture_name: ''
  });

  const disciplineOptions = [
    { value: 'trap', label: 'Trap' },
    { value: 'skeet', label: 'Skeet' },
    { value: 'sporting_clays', label: 'Sporting Clays' },
    { value: 'down_the_line', label: 'Down the Line' },
    { value: 'olympic_trap', label: 'Olympic Trap' },
    { value: 'american_trap', label: 'American Trap' }
  ];

  const weatherOptions = [
    { value: '', label: 'Select Weather' },
    { value: 'sunny', label: 'Sunny' },
    { value: 'cloudy', label: 'Cloudy' },
    { value: 'windy', label: 'Windy' },
    { value: 'rainy', label: 'Rainy' },
    { value: 'overcast', label: 'Overcast' }
  ];

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      const response = await axios.get(`${API}/fixtures`);
      setFixtures(response.data);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'fixture_id') {
      if (value) {
        const selectedFixture = fixtures.find(f => f.id === value);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          fixture_name: selectedFixture ? selectedFixture.name : '',
          // Auto-populate some fields from fixture if not already filled
          location: prev.location || selectedFixture?.location || '',
          discipline: selectedFixture?.discipline || prev.discipline,
          date: selectedFixture?.date || prev.date,
          time: selectedFixture?.time || prev.time
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          fixture_id: '',
          fixture_name: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location || !formData.total_clays || !formData.clays_hit) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseInt(formData.clays_hit) > parseInt(formData.total_clays)) {
      alert('Clays hit cannot be more than total clays');
      return;
    }

    setLoading(true);

    try {
      const sessionData = {
        ...formData,
        total_clays: parseInt(formData.total_clays),
        clays_hit: parseInt(formData.clays_hit),
        temperature: formData.temperature ? parseInt(formData.temperature) : null,
        weather: formData.weather || null,
        wind_speed: formData.wind_speed || null,
        gun_used: formData.gun_used || null,
        cartridge_type: formData.cartridge_type || null,
        choke_used: formData.choke_used || null,
        notes: formData.notes || null
      };

      await onAddSession(sessionData);
      navigate('/');
    } catch (error) {
      console.error('Error adding session:', error);
      alert('Error adding session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const accuracy = formData.total_clays && formData.clays_hit 
    ? Math.round((parseInt(formData.clays_hit) / parseInt(formData.total_clays)) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img 
            src="https://images.unsplash.com/photo-1617619667494-6b3f51ce58a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHx0YXJnZXQlMjBzaG9vdGluZ3xlbnwwfHx8fDE3NTMxNDgwMTR8MA&ixlib=rb-4.1.0&q=85"
            alt="Target Shooting"
            className="hero-image mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Session</h1>
          <p className="text-gray-600">Record your clay pigeon shooting performance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., City Gun Club"
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

          {/* Fixture Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Link to Fixture (Optional)
            </label>
            <select
              name="fixture_id"
              value={formData.fixture_id}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">No fixture - Regular practice session</option>
              {fixtures.map(fixture => (
                <option key={fixture.id} value={fixture.id}>
                  {fixture.name} - {new Date(fixture.date).toLocaleDateString()} at {fixture.location}
                </option>
              ))}
            </select>
            {formData.fixture_id && (
              <p className="text-xs text-gray-600 mt-1">
                Session will be linked to: <span className="font-semibold">{formData.fixture_name}</span>
              </p>
            )}
          </div>

          {/* Shooting Performance */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shooting Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Clays *
                </label>
                <input
                  type="number"
                  name="total_clays"
                  value={formData.total_clays}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="1"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Clays Hit *
                </label>
                <input
                  type="number"
                  name="clays_hit"
                  value={formData.clays_hit}
                  onChange={handleInputChange}
                  placeholder="20"
                  min="0"
                  max={formData.total_clays || 100}
                  className="form-input"
                  required
                />
              </div>

              <div className="flex items-end">
                <div className="bg-purple-100 rounded-lg p-4 w-full text-center">
                  <div className="text-sm text-purple-600 font-medium mb-1">Accuracy</div>
                  <div className="text-2xl font-bold text-purple-800">{accuracy}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weather
                </label>
                <select
                  name="weather"
                  value={formData.weather}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {weatherOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  placeholder="20"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wind Speed
                </label>
                <input
                  type="text"
                  name="wind_speed"
                  value={formData.wind_speed}
                  onChange={handleInputChange}
                  placeholder="Light breeze"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gun Used
                </label>
                <input
                  type="text"
                  name="gun_used"
                  value={formData.gun_used}
                  onChange={handleInputChange}
                  placeholder="e.g., Beretta 682"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cartridge Type
                </label>
                <input
                  type="text"
                  name="cartridge_type"
                  value={formData.cartridge_type}
                  onChange={handleInputChange}
                  placeholder="e.g., 12g 28g #7.5"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Choke Used
                </label>
                <input
                  type="text"
                  name="choke_used"
                  value={formData.choke_used}
                  onChange={handleInputChange}
                  placeholder="e.g., 1/2 & 3/4"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes about your session..."
              className="form-textarea"
              rows="3"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Adding Session...' : 'Add Session'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSession;