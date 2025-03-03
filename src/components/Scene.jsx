// Scene.jsx
import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, OrbitControls, Grid, Stats } from '@react-three/drei'
import { useControls, folder } from 'leva' // Modern alternative to dat.GUI
import * as THREE from 'three'

import { OutsideEdgesGeometry } from '../geometries/OutsideEdgesGeometry.js'
import { ConditionalEdgesGeometry } from '../geometries/ConditionalEdgesGeometry.js'
import { ConditionalEdgesShader } from '../shaders/ConditionalEdgesShader.js'
import { ConditionalLineSegmentsGeometry } from '../geometries/ConditionalLineSegmentsGeometry.js'
import { ConditionalLineMaterial } from '../materials/ConditionalLineMaterial.js'
import { ColoredShadowMaterial } from '../materials/ColoredShadowMaterial.js'


import AnnotationSystem from './Annotations'
import Models from './Models'

// Constant color definitions
const LIGHT_BACKGROUND = '#eeeeee'
const LIGHT_MODEL = '#ffffff'
const LIGHT_LINES = '#455A64'
const LIGHT_SHADOW = '#c4c9cb'

const DARK_BACKGROUND = '#111111'
const DARK_MODEL = '#111111'
const DARK_LINES = '#b0bec5'
const DARK_SHADOW = '#2c2e2f'

const Scene = () => {
  return (
    <Canvas shadows>
      <SceneContent />
    </Canvas>
  )
}

const SceneContent = () => {
  const { scene } = useThree()
  const [annotations, setAnnotations] = useState([])
  
  // Replace dat.GUI with leva controls
  const [controls, setControls] = useControls(() => ({
    colors: {
      value: 'LIGHT',
      options: ['LIGHT', 'DARK', 'CUSTOM']
    },
    backgroundColor: '#0d2a28',
    modelColor: '#0d2a28',
    lineColor: '#ffb400',
    shadowColor: '#44491f',
    
    model: folder({
      type: {
        value: 'HELMET',
        options: ['HELMET', 'CYLINDER']
      },
      opacity: {
        value: 0.85, 
        min: 0, 
        max: 1.0,
        step: 0.01
      },
      lit: false
    }),
    
    lines: folder({
      threshold: {
        value: 40,
        min: 0,
        max: 120
      },
      display: {
        value: 'THRESHOLD_EDGES',
        options: ['THRESHOLD_EDGES', 'NORMAL_EDGES', 'NONE']
      },
      displayConditionalEdges: true,
      useThickLines: false,
      thickness: {
        value: 1,
        min: 0,
        max: 5
      }
    }),
    
    helpers: folder({
      showAxes: {
        value: true, 
        label: 'Show Axes'
      },
      showGrid: {
        value: true,
        label: 'Show Grid'
      },
      showCamera: {
        value: false,
        label: 'Show Camera'
      }
    }),
    
    annotations: folder({
      showAnnotations: true
    }),
    
    randomize: button(() => {
      // Implement randomize colors function
      const lineH = Math.random()
      const lineS = Math.random() * 0.2 + 0.8
      const lineL = Math.random() * 0.2 + 0.4
      
      const lineColor = new THREE.Color().setHSL(lineH, lineS, lineL).getHexString()
      const backgroundColor = new THREE.Color().setHSL(
        (lineH + 0.35 + 0.3 * Math.random()) % 1.0,
        lineS * (0.25 + Math.random() * 0.75),
        1.0 - lineL
      ).getHexString()
      
      const color1 = new THREE.Color(`#${lineColor}`)
      const color2 = new THREE.Color(`#${backgroundColor}`)
      const shadowColor = color1.lerp(color2, 0.7).getHexString()
      
      // Update controls
      setControls({
        lineColor: `#${lineColor}`,
        backgroundColor: `#${backgroundColor}`,
        modelColor: `#${backgroundColor}`,
        shadowColor: `#${shadowColor}`,
        colors: 'CUSTOM'
      });
    })
  }));
  
  // Update background color
  useEffect(() => {
    let backgroundColor
    if (controls.colors === 'LIGHT') {
      backgroundColor = LIGHT_BACKGROUND
    } else if (controls.colors === 'DARK') {
      backgroundColor = DARK_BACKGROUND
    } else {
      backgroundColor = controls.backgroundColor
    }
    
    scene.background = new THREE.Color(backgroundColor)
  }, [controls.colors, controls.backgroundColor, scene])
  
  const onAddAnnotation = (position, index) => {
    setAnnotations(prev => [...prev, { position, index }])
  }
  
  const onRemoveAnnotation = (index) => {
    setAnnotations(prev => prev.filter((_, i) => i !== index))
  }
  
  return (
    <>
      {/* Camera */}
      <OrthographicCamera makeDefault position={[-10, 10, 10]} zoom={180} />
      <OrbitControls maxDistance={200} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      
      {/* Floor */}
      <Floor 
  visible={controls?.model?.lit ?? false} 
  opacity={controls?.model?.opacity ?? 0.85} 
  color={getColorValue(controls, 'shadow')} 
/>
      
      {/* Models */}
      <Models 
      modelType={controls?.model?.type ?? 'HELMET'}
      displayMode={controls?.lines?.display ?? 'THRESHOLD_EDGES'}
      threshold={controls?.lines?.threshold ?? 40}
      useThickLines={controls?.lines?.useThickLines ?? false}
      thickness={controls?.lines?.thickness ?? 1}
      showConditionalEdges={controls?.lines?.displayConditionalEdges ?? true}
      lit={controls?.model?.lit ?? false}
      opacity={controls?.model?.opacity ?? 0.85}
      modelColor={getColorValue(controls, 'model')}
      lineColor={getColorValue(controls, 'line')}
      shadowColor={getColorValue(controls, 'shadow')}
    />
      
      {/* Helpers */}
      {controls?.helpers?.showAxes && <axesHelper args={[5]} />}
      {controls?.helpers?.showGrid && <Grid />}
      {controls?.helpers?.showCamera && <CameraHelper />}
            
      {/* Annotations */}
      <AnnotationSystem 
         annotations={annotations}
         visible={controls?.annotations?.showAnnotations ?? true}
         onAddAnnotation={onAddAnnotation}
         onRemoveAnnotation={onRemoveAnnotation}
      />
      
      <Stats />
    </>
  )
}

// Helper function to get the correct color based on theme
function getColorValue(controls, type) {
  if (!controls) return type === 'line' ? LIGHT_LINES :
                         type === 'model' ? LIGHT_MODEL :
                         type === 'shadow' ? LIGHT_SHADOW :
                         LIGHT_BACKGROUND;
                         
  if (controls.colors === 'LIGHT') {
    return type === 'line' ? LIGHT_LINES :
           type === 'model' ? LIGHT_MODEL :
           type === 'shadow' ? LIGHT_SHADOW :
           LIGHT_BACKGROUND
  } else if (controls.colors === 'DARK') {
    return type === 'line' ? DARK_LINES :
           type === 'model' ? DARK_MODEL :
           type === 'shadow' ? DARK_SHADOW :
           DARK_BACKGROUND
  } else {
    return type === 'line' ? controls.lineColor :
           type === 'model' ? controls.modelColor :
           type === 'shadow' ? controls.shadowColor :
           controls.backgroundColor
  }
}

// Simple floor component
const Floor = ({ visible, opacity, color }) => {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]}
      scale={[20, 20, 20]} 
      receiveShadow 
      visible={visible}
    >
      <planeGeometry />
      <shadowMaterial 
        transparent={opacity !== 1.0}
        opacity={opacity}
        color={color}
      />
    </mesh>
  )
}

// Camera helper
const CameraHelper = () => {
  const { camera } = useThree()
  return <cameraHelper args={[camera]} />
}

// Missing from the initial code - import the button component from leva
import { button } from 'leva'

export default Scene