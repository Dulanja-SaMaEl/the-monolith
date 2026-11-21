import React from 'react';
import { MedianStudio } from './components/MedianStudio/MedianStudio';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <MedianStudio />
    </ErrorBoundary>
  );
}

export default App;
