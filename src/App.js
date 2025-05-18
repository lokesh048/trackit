import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import ThemeProvider, { ThemeContext } from './context/ThemeContext';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import ForgotPassword from './components/ForgotPassword';

function AppContent() {
  const [userProfile, setUserProfile] = useState(null);
  const { dark } = useContext(ThemeContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user profile from Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          // If user profile doesn't exist, fallback to auth user object
          setUserProfile({
            uid: currentUser.uid,
            name: currentUser.email.split('@')[0], // default username
            email: currentUser.email,
          });
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className={dark ? 'dark' : 'light'} style={{ minHeight: '100vh' }}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={userProfile ? <Dashboard user={userProfile} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={!userProfile ? <Auth /> : <Navigate to="/" replace />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="*"
            element={<Navigate to={userProfile ? "/" : "/login"} replace />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
