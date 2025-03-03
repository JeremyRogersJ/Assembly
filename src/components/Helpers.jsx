// Helpers.jsx
import React from 'react';
import { useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';

const Helpers = ({ 
  showAxes = true, 
  showGrid = true, 
  showCamera = false,
  axesSize = 5,
  gridSize = 10,
  gridDivisions = 10
}) => {
  const { camera } = useThree();
  
  return (
    <>
      {showAxes && <axesHelper args={[axesSize]} />}
      
      {showGrid && (
        <Grid
          args={[gridSize, gridSize, gridDivisions, gridDivisions]}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}
      
      {showCamera && <cameraHelper args={[camera]} />}
    </>
  );
};

export default Helpers;