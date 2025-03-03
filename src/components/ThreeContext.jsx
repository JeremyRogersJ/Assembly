// ThreeContext.jsx
import React, { createContext, useContext, useMemo } from 'react';
import { useModels } from '../hooks/useModels';
import { useAnnotations } from '../hooks/useAnnotations';
import { useThreeState } from '../hooks/useThreeState';

// Create the context
const ThreeContext = createContext(null);

// Provider component
export function ThreeProvider({ children }) {
  // Use our custom hooks to manage state
  const modelsState = useModels();
  const annotationsState = useAnnotations();
  const threeState = useThreeState();
  
  // Combine all state and functions into a single value
  const contextValue = useMemo(() => ({
    // Models
    ...modelsState,
    
    // Annotations
    ...annotationsState,
    
    // Three.js state (colors, options, etc.)
    ...threeState
  }), [modelsState, annotationsState, threeState]);
  
  return (
    <ThreeContext.Provider value={contextValue}>
      {children}
    </ThreeContext.Provider>
  );
}

// Custom hook to use the Three context
export function useThreeContext() {
  const context = useContext(ThreeContext);
  if (context === null) {
    throw new Error('useThreeContext must be used within a ThreeProvider');
  }
  return context;
}

export default ThreeContext;