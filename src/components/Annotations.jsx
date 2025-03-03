// Annotations.jsx
import React, { useRef, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const AnnotationSystem = ({ annotations, visible, onAddAnnotation, onRemoveAnnotation }) => {
  const { camera, raycaster, scene, gl } = useThree()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  
  // Set up click handler for adding annotations
  useEffect(() => {
    const handleClick = (event) => {
      // Calculate mouse position in normalized device coordinates
      const mouse = new THREE.Vector2()
      mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1
      mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, camera)
      
      // Find intersections with objects in the scene
      const intersects = raycaster.intersectObjects(scene.children, true)
      
      // Filter for mesh objects only (not annotations or helpers)
      const meshIntersects = intersects.filter(intersect => 
        intersect.object.isMesh && 
        !intersect.object.userData.isAnnotation
      )
      
      if (meshIntersects.length > 0) {
        const intersectionPoint = meshIntersects[0].point
        const nextIndex = annotations.length + 1
        onAddAnnotation(intersectionPoint, nextIndex)
      }
    }
    
    const handleRightClick = (event) => {
      event.preventDefault()
      
      // Calculate mouse position
      const mouse = new THREE.Vector2()
      mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1
      mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      
      // Find closest annotation (using screen-space distance)
      const closestIndex = findClosestAnnotation(mouse, camera, annotations)
      
      if (closestIndex !== -1) {
        onRemoveAnnotation(closestIndex)
      }
    }
    
    // Add event listeners
    gl.domElement.addEventListener('click', handleClick)
    gl.domElement.addEventListener('contextmenu', handleRightClick)
    
    // Cleanup
    return () => {
      gl.domElement.removeEventListener('click', handleClick)
      gl.domElement.removeEventListener('contextmenu', handleRightClick)
    }
  }, [camera, raycaster, gl, scene, annotations, onAddAnnotation, onRemoveAnnotation])
  
  // Update annotation visibility based on occlusion
  useFrame(() => {
    if (!visible) return
    
    // For each annotation, check if it's occluded by other objects
    annotations.forEach((annotation, index) => {
      const screenPosition = annotation.position.clone()
      screenPosition.project(camera)
      
      // Create a ray from the camera to the annotation point
      raycaster.setFromCamera(screenPosition, camera)
      
      // Find intersections
      const intersects = raycaster.intersectObjects(scene.children, true)
      
      // Determine if annotation is visible (not occluded)
      let isVisible = true
      
      if (intersects.length > 0) {
        // Get distance to the first intersection
        const intersectionDistance = intersects[0].distance
        
        // Get distance to the annotation
        const annotationDistance = annotation.position.distanceTo(camera.position)
        
        // If intersection is closer than annotation, then annotation is occluded
        if (intersectionDistance < annotationDistance - 0.01) {
          isVisible = false
        }
      }
      
      // Store visibility in annotation object for HTML component to use
      annotation.isVisible = isVisible
    })
  })
  
  if (!visible) return null
  
  return (
    <group>
      {annotations.map((annotation, index) => (
        <AnnotationPoint
          key={index}
          position={annotation.position}
          number={index + 1}
          isVisible={annotation.isVisible}
          isHovered={hoveredIndex === index}
          onHover={() => setHoveredIndex(index)}
          onBlur={() => setHoveredIndex(null)}
          onClick={() => {/* Handle click, perhaps show detailed info */}}
        />
      ))}
    </group>
  )
}

// Individual annotation point component
const AnnotationPoint = ({ 
  position, 
  number, 
  isVisible, 
  isHovered,
  onHover,
  onBlur,
  onClick 
}) => {
  return (
    <Html position={position} style={{ pointerEvents: isVisible ? 'auto' : 'none' }}>
      <div 
        className={`annotation-point ${isVisible ? 'visible' : ''} ${isHovered ? 'highlighted' : ''}`}
        onMouseEnter={onHover}
        onMouseLeave={onBlur}
        onClick={onClick}
      >
        {number}
      </div>
    </Html>
  )
}

// Helper function to find the closest annotation to a screen position
function findClosestAnnotation(mousePosition, camera, annotations) {
  if (annotations.length === 0) return -1
  
  const threshold = 0.1 // Selection threshold
  let closestDistance = threshold
  let closestIndex = -1
  
  annotations.forEach((anno, index) => {
    const screenPos = anno.position.clone().project(camera)
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - screenPos.x, 2) + 
      Math.pow(mousePosition.y - screenPos.y, 2)
    )
    
    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  })
  
  return closestIndex
}

export default AnnotationSystem