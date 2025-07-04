// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Home from './pages/Home';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';
import Login from './pages/Login';       
import Register from './pages/Register'; 
import './App.css';

/* simple auth helper */
const useAuth = () => {
  const [logged, setLogged] = useState(localStorage.getItem('logged') === 'yes');

  /* keep state in sync if another tab logs out */
  useEffect(() => {
    const handler = () => setLogged(localStorage.getItem('logged') === 'yes');
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return logged;
};

function App() {
  const loggedIn = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        {loggedIn ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateTask />} />
            <Route path="/edit/:id" element={<EditTask />} />
          </>
        ) : (
          /* If not logged in, redirect everything else to /login */
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

