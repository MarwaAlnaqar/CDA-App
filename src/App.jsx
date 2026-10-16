
import React from 'react';

import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Advocacy from './Advocacy.jsx';
import Protection from './Protection.jsx';
import Empowerment from './Empowerment.jsx';
export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/advocacy" replace />}
      />

      <Route
        path="/advocacy/*"
        element={<Advocacy />}
      />

      <Route
        path="/protection/*"
        element={<Protection />}
      />
<Route
  path="/empowerment/*"
  element={<Empowerment />}
/>
      <Route
        path="*"
        element={<Navigate to="/advocacy" replace />}
      />
    </Routes>
  );
}
