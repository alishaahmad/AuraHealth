import { useState } from 'react'
import { LandingPage } from './components/LandingPage'
import { AboutPage } from './components/AboutPage'
import { Dashboard } from './components/Dashboard'

import './App.css'

type Page = 'landing' | 'about' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  console.log('App rendered with currentPage:', currentPage);

  const handleNavigateToAbout = () => {
    console.log('App: Navigating to about...');
    setCurrentPage('about');
  };

  const handleNavigateToDashboard = () => {
    console.log('App: Navigating to dashboard...');
    setCurrentPage('dashboard');
  };

  const handleBackToHome = () => {
    console.log('App: Navigating back to home...');
    setCurrentPage('landing');
  };

  const handleLogout = () => {
    console.log('App: Logging out...');
    setCurrentPage('landing');
  };

  const handleSubscribeNewsletter = (email: string) => {
    // In a real app, this would send the email to your backend
    console.log('Newsletter subscription:', email);
    // You could show a toast notification here
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' && (
        <LandingPage
          onNavigateToAbout={handleNavigateToAbout}
          onNavigateToDashboard={handleNavigateToDashboard}
          onSubscribeNewsletter={handleSubscribeNewsletter}
        />
      )}
      {currentPage === 'about' && (
        <AboutPage
          onBackToHome={handleBackToHome}
          onNavigateToDashboard={handleNavigateToDashboard}
          onSubscribeNewsletter={handleSubscribeNewsletter}
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App
