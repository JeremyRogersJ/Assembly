// useAnnotations.js
import { useState, useCallback, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function useAnnotations() {
  const [annotations, setAnnotations] = useState([]);
  const { camera, scene, raycaster } = useThree();
  
  // Add a new annotation at the specified position
  const addAnnotation = useCallback((position, data = {}) => {
    setAnnotations(prevAnnotations => [
      ...prevAnnotations,
      {
        id: Date.now().toString(),
        position: position.clone(),
        isVisible: true,
        ...data
      }
    ]);
  }, []);
  
  // Remove an annotation by index
  const removeAnnotation = useCallback((index) => {
    setAnnotations(prevAnnotations => 
      prevAnnotations.filter((_, i) => i !== index)
    );
  }, []);
  
  // Remove an annotation by id
  const removeAnnotationById = useCallback((id) => {
    setAnnotations(prevAnnotations => 
      prevAnnotations.filter(anno => anno.id !== id)
    );
  }, []);
  
  // Clear all annotations
  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
  }, []);
  
  // Find the closest annotation to a screen position
  const findClosestAnnotation = useCallback((mousePosition, threshold = 0.1) => {
    if (annotations.length === 0) return -1;
    
    let closestDistance = threshold;
    let closestIndex = -1;
    
    annotations.forEach((anno, index) => {
      const screenPos = anno.position.clone().project(camera);
      const distance = Math.sqrt(
        Math.pow(mousePosition.x - screenPos.x, 2) + 
        Math.pow(mousePosition.y - screenPos.y, 2)
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    return closestIndex;
  }, [annotations, camera]);
  
  // Update annotation visibility based on occlusion
  useFrame(() => {
    if (annotations.length === 0) return;
    
    setAnnotations(prevAnnotations => 
      prevAnnotations.map(annotation => {
        // Project annotation position to screen space
        const screenPosition = annotation.position.clone();
        screenPosition.project(camera);
        
        // Create a ray from the camera to the annotation
        raycaster.setFromCamera(screenPosition, camera);
        
        // Find intersections with objects in the scene
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        let isVisible = true;
        if (intersects.length > 0) {
          // Get distance to the first intersection
          const intersectionDistance = intersects[0].distance;
          
          // Get distance to the annotation
          const annotationDistance = annotation.position.distanceTo(camera.position);
          
          // If intersection is closer than annotation, annotation is occluded
          if (intersectionDistance < annotationDistance - 0.01) {
            isVisible = false;
          }
        }
        
        return { ...annotation, isVisible };
      })
    );
  });
  
  return {
    annotations,
    addAnnotation,
    removeAnnotation,
    removeAnnotationById,
    clearAnnotations,
    findClosestAnnotation,
  };
}