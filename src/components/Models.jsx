// Models.jsx
import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { mergeBufferGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import * as THREE from 'three'

import { OutsideEdgesGeometry } from '../geometries/OutsideEdgesGeometry.js'
import { ConditionalEdgesGeometry } from '../geometries/ConditionalEdgesGeometry.js'
import { ConditionalEdgesShader } from '../shaders/ConditionalEdgesShader.js'
import { ConditionalLineSegmentsGeometry } from '../geometries/ConditionalLineSegmentsGeometry.js'
import { ConditionalLineMaterial } from '../materials/ConditionalLineMaterial.js'
import { ColoredShadowMaterial } from '../materials/ColoredShadowMaterial.js'

const Models = ({
  modelType,
  displayMode,
  threshold,
  useThickLines,
  thickness,
  showConditionalEdges,
  lit,
  opacity,
  modelColor,
  lineColor,
  shadowColor
}) => {
  const { size } = useThree()
  
  // Create model references
  const edgesModel = useRef()
  const backgroundModel = useRef()
  const shadowModel = useRef()
  const conditionalModel = useRef()
  
  // Set up cylinder model
  const cylinderGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.25, 0.25, 0.5, 100)
  }, [])
  
  // Use the cylinder as the base geometry instead of trying to load GLTF
  const mergedGeometry = useMemo(() => {
    return cylinderGeometry
  }, [cylinderGeometry])
  
  // Process edges geometry based on display mode
  const edgesGeometry = useMemo(() => {
    if (!mergedGeometry) return null
    
    if (displayMode === 'THRESHOLD_EDGES') {
      return new THREE.EdgesGeometry(mergedGeometry, threshold)
    } else if (displayMode === 'NORMAL_EDGES') {
      const geom = mergedGeometry.clone()
      return new OutsideEdgesGeometry(mergeVertices(geom, 1e-3))
    }
    
    return null
  }, [mergedGeometry, displayMode, threshold])
  
  // Process conditional edges geometry
  const conditionalEdgesGeometry = useMemo(() => {
    if (!mergedGeometry || !showConditionalEdges) return null
    
    const geom = mergedGeometry.clone()
    for (const key in geom.attributes) {
      if (key !== 'position') {
        geom.deleteAttribute(key)
      }
    }
    
    try {
      return new ConditionalEdgesGeometry(mergeVertices(geom))
    } catch (e) {
      console.error("Error creating conditional edges:", e)
      return null
    }
  }, [mergedGeometry, showConditionalEdges])
  
  // Update material resolutions on viewport resize
  useEffect(() => {
    const updateResolutions = () => {
      const resolution = new THREE.Vector2(size.width, size.height)
      resolution.multiplyScalar(window.devicePixelRatio)
      
      // Update line materials with new resolution
      if (edgesModel.current) {
        edgesModel.current.traverse(child => {
          if (child.material && child.material.resolution) {
            child.material.resolution.copy(resolution)
            child.material.linewidth = thickness
          }
        })
      }
      
      if (conditionalModel.current) {
        conditionalModel.current.traverse(child => {
          if (child.material && child.material.resolution) {
            child.material.resolution.copy(resolution)
            child.material.linewidth = thickness
          }
        })
      }
    }
    
    updateResolutions()
  }, [size, thickness])
  
  if (!mergedGeometry) return null
  
  return (
    <group>
      {/* Background Model */}
      {!lit && (
        <mesh geometry={mergedGeometry} ref={backgroundModel}>
          <meshBasicMaterial 
            color={modelColor} 
            transparent={opacity !== 1.0}
            opacity={opacity}
            polygonOffset={true}
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
      )}
      
      {/* Shadow Model */}
      {lit && (
        <mesh geometry={mergedGeometry} ref={shadowModel} receiveShadow>
          <primitive object={new ColoredShadowMaterial({
            color: modelColor,
            shadowColor: shadowColor,
            opacity: opacity,
            transparent: opacity !== 1.0,
            shininess: 1.0,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
          })} />
        </mesh>
      )}
      
      {/* Edges Model */}
      {edgesGeometry && displayMode !== 'NONE' && (
        <group ref={edgesModel}>
          {/* Standard Lines */}
          {!useThickLines && (
            <lineSegments geometry={edgesGeometry}>
              <lineBasicMaterial color={lineColor} />
            </lineSegments>
          )}
          
          {/* Thick Lines */}
          {useThickLines && (
            <primitive object={createThickLineSegments(
              edgesGeometry, 
              lineColor, 
              thickness
            )} />
          )}
        </group>
      )}
      
      {/* Conditional Edges */}
      {conditionalEdgesGeometry && showConditionalEdges && (
        <group ref={conditionalModel}>
          {/* Standard Conditional Lines */}
          {!useThickLines && (
            <lineSegments geometry={conditionalEdgesGeometry}>
              <shaderMaterial 
                args={[ConditionalEdgesShader]}
                uniforms-diffuse-value={new THREE.Color(lineColor)}
              />
            </lineSegments>
          )}
          
          {/* Thick Conditional Lines */}
          {useThickLines && (
            <primitive object={createThickConditionalLineSegments(
              conditionalEdgesGeometry, 
              lineColor, 
              thickness
            )} />
          )}
        </group>
      )}
    </group>
  )
}

// Helper function to create thick line segments
function createThickLineSegments(geometry, color, thickness) {
  const thickLineGeom = new LineSegmentsGeometry().fromEdgesGeometry(geometry)
  const material = new LineMaterial({
    color: color,
    linewidth: thickness
  })
  
  return new LineSegments2(thickLineGeom, material)
}

// Helper function to create thick conditional line segments
function createThickConditionalLineSegments(geometry, color, thickness) {
  const thickLineGeom = new ConditionalLineSegmentsGeometry().fromConditionalEdgesGeometry(geometry)
  const material = new ConditionalLineMaterial({
    color: color,
    linewidth: thickness
  })
  
  return new LineSegments2(thickLineGeom, material)
}

export default Models