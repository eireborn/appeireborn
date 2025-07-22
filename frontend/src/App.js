import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import AddSession from "./components/AddSession";
import SessionHistory from "./components/SessionHistory";
import Statistics from "./components/Statistics";
import Navigation from "./components/Navigation";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const addSession = async (sessionData) => {
    try {
      const response = await axios.post(`${API}/sessions`, sessionData);
      setSessions(prev => [response.data, ...prev]);
      await fetchStats(); // Refresh stats
      return response.data;
    } catch (error) {
      console.error("Error adding session:", error);
      throw error;
    }
  };

  const updateSession = async (sessionId, sessionData) => {
    try {
      const response = await axios.put(`${API}/sessions/${sessionId}`, sessionData);
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? response.data : session
        )
      );
      await fetchStats(); // Refresh stats
      return response.data;
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`${API}/sessions/${sessionId}`);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      await fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSessions(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your shooting data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route 
                path="/" 
                element={<Dashboard sessions={sessions} stats={stats} />} 
              />
              <Route 
                path="/add-session" 
                element={<AddSession onAddSession={addSession} />} 
              />
              <Route 
                path="/history" 
                element={
                  <SessionHistory 
                    sessions={sessions} 
                    onUpdateSession={updateSession}
                    onDeleteSession={deleteSession}
                  />
                } 
              />
              <Route 
                path="/statistics" 
                element={<Statistics sessions={sessions} stats={stats} />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;