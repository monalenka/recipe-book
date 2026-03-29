import React from 'react';
import { FiltersProvider } from './context/FiltersContext';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <FiltersProvider>
      <AppRoutes />
    </FiltersProvider>
  );
}

export default App;