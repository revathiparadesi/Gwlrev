import React from 'react';
import BaseMapWithMarkers from './components/map/BaseMapWithMarkers';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Geospatial Dashboard</h1>
        <p className="text-sm opacity-80">Interactive map for groundwater and reservoir monitoring</p>
      </header>
      <main className="p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <BaseMapWithMarkers />
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <p>© 2025 Geospatial Dashboard</p>
      </footer>
    </div>
  );
}

export default App;