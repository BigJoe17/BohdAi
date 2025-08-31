"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from './LogoutButton';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <nav className="hero-nav">
      <div className="hero-nav-content">
        <Link href="/" className="hero-logo" aria-label="Home">
          <Image 
            src="/new-logo.png" 
            alt="Hatchways Logo" 
            width={64} 
            height={64} 
            className="rounded-md object-contain p-0.5"
            style={{ background: 'transparent' }}
            priority
          />
          <span className="logo-text">Hatchways</span>
        </Link>

        {/* Desktop Links */}
        <div className="hero-nav-links max-md:hidden">
          <Link href="/interview" className="nav-link">Practice</Link>
          <Link href="/dsa-interview" className="nav-link">DSA Practice</Link>
          <Link href="/call-data" className="nav-link">Interviews</Link>
          <LogoutButton />
          <button
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="ml-4 px-3 py-2 rounded-full bg-dark-200 text-primary-200 hover:bg-primary-200 hover:text-dark-100 transition-colors"
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden ml-4 p-2 rounded-full bg-dark-200 text-primary-200 hover:bg-primary-200 hover:text-dark-100 transition-colors"
          aria-label="Open menu"
          onClick={() => setMenuOpen((m) => !m)}
        >
          <span className="sr-only">Menu</span>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-dark-200/95 backdrop-blur-lg shadow-lg rounded-b-2xl animate-fadeIn z-40">
          <div className="flex flex-col items-center gap-6 py-6">
            <Link href="/interview" className="nav-link w-full text-center" onClick={() => setMenuOpen(false)}>Practice</Link>
            <Link href="/dsa-interview" className="nav-link w-full text-center" onClick={() => setMenuOpen(false)}>DSA Practice</Link>
            <Link href="/call-data" className="nav-link w-full text-center" onClick={() => setMenuOpen(false)}>Interviews</Link>
            <LogoutButton />
            <button
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="px-3 py-2 rounded-full bg-dark-200 text-primary-200 hover:bg-primary-200 hover:text-dark-100 transition-colors"
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
