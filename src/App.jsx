// App.jsx
import React from 'react'
import Scene from './components/Scene'
import './styles.css'

function App() {
  return (
    <div className="app-container">
      <div id="info">
        <a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> Engineering Mark Up Tool
      </div>
      
      {/* Comment out if you don't have this image */}
       <img src="./images/TossLogo.png" className="logo-image" alt="logo image" /> 
      
      <Scene />
    </div>
  )
}

export default App