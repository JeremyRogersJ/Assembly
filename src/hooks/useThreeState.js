// useThreeState.js
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Constants for color themes
const THEMES = {
  LIGHT: {
    BACKGROUND: '#eeeeee',
    MODEL: '#ffffff',
    LINES: '#455A64',
    SHADOW: '#c4c9cb'
  },
  DARK: {
    BACKGROUND: '#111111',
    MODEL: '#111111',
    LINES: '#b0bec5',
    SHADOW: '#2c2e2f'
  },
  CUSTOM: {
    BACKGROUND: '#0d2a28',
    MODEL: '#0d2a28',
    LINES: '#ffb400',
    SHADOW: '#44491f'
  }
};

export function useThreeState() {
  const { scene } = useThree();
  
  // UI state
  const [colorTheme, setColorTheme] = useState('LIGHT');
  const [customColors, setCustomColors] = useState({
    background: THEMES.CUSTOM.BACKGROUND,
    model: THEMES.CUSTOM.MODEL,
    lines: THEMES.CUSTOM.LINES,
    shadow: THEMES.CUSTOM.SHADOW
  });
  
  // Model display state
  const [modelOptions, setModelOptions] = useState({
    opacity: 0.85,
    lit: false
  });
  
  // Line display state
  const [lineOptions, setLineOptions] = useState({
    display: 'THRESHOLD_EDGES',
    threshold: 40,
    displayConditionalEdges: true,
    useThickLines: false,
    thickness: 1
  });
  
  // Helper display state
  const [helperOptions, setHelperOptions] = useState({
    showAxes: true,
    showGrid: true,
    showCamera: false
  });
  
  // Annotation state
  const [annotationOptions, setAnnotationOptions] = useState({
    showAnnotations: true
  });
  
  // Get the active colors based on the theme
  const colors = useMemo(() => {
    if (colorTheme === 'LIGHT') {
      return THEMES.LIGHT;
    } else if (colorTheme === 'DARK') {
      return THEMES.DARK;
    } else {
      return {
        BACKGROUND: customColors.background,
        MODEL: customColors.model,
        LINES: customColors.lines,
        SHADOW: customColors.shadow
      };
    }
  }, [colorTheme, customColors]);
  
  // Update scene background when colors change
  useEffect(() => {
    if (scene) {
      scene.background = new THREE.Color(colors.BACKGROUND);
    }
  }, [scene, colors.BACKGROUND]);
  
  // Generate random colors
  const randomizeColors = useCallback(() => {
    const lineH = Math.random();
    const lineS = Math.random() * 0.2 + 0.8;
    const lineL = Math.random() * 0.2 + 0.4;
    
    const lineColor = new THREE.Color().setHSL(lineH, lineS, lineL);
    
    const backgroundH = (lineH + 0.35 + 0.3 * Math.random()) % 1.0;
    const backgroundS = lineS * (0.25 + Math.random() * 0.75);
    const backgroundL = 1.0 - lineL;
    
    const backgroundColor = new THREE.Color().setHSL(backgroundH, backgroundS, backgroundL);
    
    // Create shadow color as a mix between line and background
    const shadowColor = lineColor.clone().lerp(backgroundColor, 0.7);
    
    setColorTheme('CUSTOM');
    setCustomColors({
      background: '#' + backgroundColor.getHexString(),
      model: '#' + backgroundColor.getHexString(),
      lines: '#' + lineColor.getHexString(),
      shadow: '#' + shadowColor.getHexString()
    });
  }, []);
  
  // Update model options
  const updateModelOptions = useCallback((options) => {
    setModelOptions(prev => ({ ...prev, ...options }));
  }, []);
  
  // Update line options
  const updateLineOptions = useCallback((options) => {
    setLineOptions(prev => ({ ...prev, ...options }));
  }, []);
  
  // Update helper options
  const updateHelperOptions = useCallback((options) => {
    setHelperOptions(prev => ({ ...prev, ...options }));
  }, []);
  
  // Update annotation options
  const updateAnnotationOptions = useCallback((options) => {
    setAnnotationOptions(prev => ({ ...prev, ...options }));
  }, []);
  
  return {
    // Color state
    colorTheme,
    setColorTheme,
    customColors,
    setCustomColors,
    colors,
    randomizeColors,
    
    // Model options
    modelOptions,
    updateModelOptions,
    
    // Line options
    lineOptions,
    updateLineOptions,
    
    // Helper options
    helperOptions,
    updateHelperOptions,
    
    // Annotation options
    annotationOptions,
    updateAnnotationOptions
  };
}