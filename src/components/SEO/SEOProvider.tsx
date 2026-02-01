import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

interface SEOProviderProps {
  children: React.ReactNode;
}

const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default SEOProvider;
