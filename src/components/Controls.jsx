// Controls.jsx
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const Controls = ({ maxDistance = 200, target = [0, 0, 0], ...props }) => {
  const controlsRef = useRef();
  const { camera, gl } = useThree();
  
  // Update controls when camera or target changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(...target);
    }
  }, [target]);
  
  // Additional setup for OrbitControls
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });
  
  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      maxDistance={maxDistance}
      enableDamping
      dampingFactor={0.05}
      {...props}
    />
  );
};

export default Controls;