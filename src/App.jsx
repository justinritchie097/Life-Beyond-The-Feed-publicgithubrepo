import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  Navigate,
  HashRouter,
} from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import HomePage from './HomePage';
import PostDetail from './PostDetail';
import Siteintro from './Siteintro';
import CreatePost from './CreatePost';
import Auth from './Auth';
import './App.css';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <HashRouter>
      {/* Navbar stays visible across "/", "/feed", "/post/:id", "/create", and "/auth" */}
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">Life Beyond the Feed</Link>
        </div>

        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            About
          </NavLink>

          <NavLink
            to="/feed"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Forum
          </NavLink>

          {/* Show Create Post + Sign Out when signed in; otherwise show Sign In / Sign Up */}
          {session ? (
            <>
              <NavLink
                to="/create"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                + New Post
              </NavLink>
              <span className="nav-user">
                @{session.user.user_metadata?.username || 'member'}
              </span>
              <button onClick={handleSignOut} className="nav-signout-btn">
                Sign Out
              </button>
            </>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                isActive ? 'nav-auth-btn active' : 'nav-auth-btn'
              }
            >
              Sign In / Sign Up
            </NavLink>
          )}
        </div>
      </nav>

      <main className="app-container">
        <Routes>
          {/* Public routes: accessible to everyone */}
          <Route path="/" element={<Siteintro session={session} />} />
          <Route path="/feed" element={<HomePage session={session} />} />
          <Route path="/post/:id" element={<PostDetail session={session} />} />

          {/* Protected route: redirects guests to /auth if they try to visit /create */}
          <Route
            path="/create"
            element={
              session ? (
                <CreatePost session={session} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Auth route: redirects to /feed once signed in */}
          <Route
            path="/auth"
            element={session ? <Navigate to="/feed" replace /> : <Auth />}
          />
        </Routes>
      </main>
    </HashRouter>
  );
}
