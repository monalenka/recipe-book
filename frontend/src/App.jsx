import React from 'react';
import { FiltersProvider } from './context/FiltersContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <FiltersProvider>
        <AppRoutes />
      </FiltersProvider>
    </NotificationProvider>
  );
}

export default App;