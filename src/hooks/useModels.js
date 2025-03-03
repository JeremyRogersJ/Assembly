// useModels.js
import { useState, useMemo, useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { mergeBufferGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils';

export function useModels() {
  const [modelType, setModelType] = useState('HELMET');
  
  // Create the basic cylinder model
  const cylinderModel = useMemo(() => {
    const geometry = new THREE.CylinderBufferGeometry(0.25, 0.25, 0.5, 100);
    geometry.computeBoundingBox();
    
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(geometry);
    mesh.castShadow = true;
    group.add(mesh);
    
    return group;
  }, []);
  
  // Load the GLTF model
  const gltfResult = useLoader(GLTFLoader, './models/loader.glb', undefined, (error) => {
    console.error('Error loading GLTF model:', error);
  });
  
  // Process and merge the GLTF model
  const helmetModel = useMemo(() => {
    if (!gltfResult) return null;
    
    // Create a function to merge object geometries
    const mergeObject = (object) => {
      object.updateMatrixWorld(true);
      
      const geometry = [];
      object.traverse(c => {
        if (c.isMesh) {
          const g = c.geometry;
          g.applyMatrix4(c.matrixWorld);
          
          // Clean up unnecessary attributes
          for (const key in g.attributes) {
            if (key !== 'position' && key !== 'normal') {
              g.deleteAttribute(key);
            }
          }
          
          geometry.push(g.toNonIndexed());
        }
      });
      
      if (geometry.length === 0) return null;
      
      const mergedGeometries = mergeBufferGeometries(geometry, false);
      const mergedGeometry = mergeVertices(mergedGeometries).center();
      
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(mergedGeometry);
      mesh.castShadow = true;
      group.add(mesh);
      
      return group;
    };
    
    return mergeObject(gltfResult.scene);
  }, [gltfResult]);
  
  // Get the currently active model based on modelType
  const activeModel = useMemo(() => {
    switch (modelType) {
      case 'CYLINDER':
        return cylinderModel;
      case 'HELMET':
        return helmetModel || cylinderModel; // Fallback to cylinder if helmet isn't loaded
      default:
        return cylinderModel;
    }
  }, [modelType, cylinderModel, helmetModel]);
  
  // Function to get the model by type
  const getModel = useCallback((type) => {
    switch (type) {
      case 'CYLINDER':
        return cylinderModel;
      case 'HELMET':
        return helmetModel || cylinderModel;
      default:
        return null;
    }
  }, [cylinderModel, helmetModel]);
  
  return {
    modelType,
    setModelType,
    activeModel,
    getModel,
    models: {
      CYLINDER: cylinderModel,
      HELMET: helmetModel
    },
    isLoaded: !!helmetModel
  };
}