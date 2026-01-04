// resources/jsx/components/layouts/layout.jsx
import React from 'react';
import Navigation from '../Navigation'; // Your header component
import Footer from '../Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
