import React, { useState, useEffect, useRef } from 'react';

const Visualizer = () => {
  const canvasRef = useRef(null);
  const [visualizationType, setVisualizationType] = useState('spacetime');
  const [parameters, setParameters] = useState({
    mass: 1.0,
    radius: 10.0,
    resolution: 50
  });
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (e) => {
    setVisualizationType(e.target.value);
  };

  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    setParameters({
      ...parameters,
      [name]: parseFloat(value)
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 600;
    
    // Draw visualization based on type
    drawVisualization(ctx, canvas.width, canvas.height);
  }, [visualizationType, parameters]);

  const drawVisualization = (ctx, width, height) => {
    setLoading(true);
    
    // Center of the canvas
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Scale factor
    const scale = Math.min(width, height) / 3;
    
    if (visualizationType === 'spacetime') {
      // Draw spacetime curvature (simplified representation)
      drawSpacetimeCurvature(ctx, centerX, centerY, scale);
    } else if (visualizationType === 'gravitational') {
      // Draw gravitational field
      drawGravitationalField(ctx, centerX, centerY, scale);
    } else {
      // Draw geodesics
      drawGeodesics(ctx, centerX, centerY, scale);
    }
    
    setLoading(false);
  };

  const drawSpacetimeCurvature = (ctx, centerX, centerY, scale) => {
    const { mass, resolution } = parameters;
    
    // Draw grid representing spacetime
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    // Draw curved grid
    for (let i = 0; i <= resolution; i++) {
      ctx.beginPath();
      for (let j = 0; j <= resolution; j++) {
        const x = (j / resolution) * 2 - 1;
        const y = (i / resolution) * 2 - 1;
        
        // Calculate displacement based on mass (simplified model)
        const distance = Math.sqrt(x * x + y * y);
        const displacement = mass * 0.5 / (distance + 0.5);
        
        // Apply displacement towards center
        const angle = Math.atan2(y, x);
        const newX = x - Math.cos(angle) * displacement * (x !== 0 ? Math.abs(x) / x : 0);
        const newY = y - Math.sin(angle) * displacement * (y !== 0 ? Math.abs(y) / y : 0);
        
        const canvasX = centerX + newX * scale;
        const canvasY = centerY + newY * scale;
        
        if (j === 0) {
          ctx.moveTo(canvasX, canvasY);
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      }
      ctx.stroke();
    }
    
    for (let j = 0; j <= resolution; j++) {
      ctx.beginPath();
      for (let i = 0; i <= resolution; i++) {
        const x = (j / resolution) * 2 - 1;
        const y = (i / resolution) * 2 - 1;
        
        // Calculate displacement based on mass (simplified model)
        const distance = Math.sqrt(x * x + y * y);
        const displacement = mass * 0.5 / (distance + 0.5);
        
        // Apply displacement towards center
        const angle = Math.atan2(y, x);
        const newX = x - Math.cos(angle) * displacement * (x !== 0 ? Math.abs(x) / x : 0);
        const newY = y - Math.sin(angle) * displacement * (y !== 0 ? Math.abs(y) / y : 0);
        
        const canvasX = centerX + newX * scale;
        const canvasY = centerY + newY * scale;
        
        if (i === 0) {
          ctx.moveTo(canvasX, canvasY);
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      }
      ctx.stroke();
    }
    
    // Draw central mass
    ctx.fillStyle = '#4a90e2';
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.max(5, mass * 5), 0, Math.PI * 2);
    ctx.fill();
  };

  const drawGravitationalField = (ctx, centerX, centerY, scale) => {
    const { mass, resolution } = parameters;
    
    // Draw arrows representing gravitational field
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = (j / (resolution - 1)) * 2 - 1;
        const y = (i / (resolution - 1)) * 2 - 1;
        
        // Skip center point
        if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) continue;
        
        const distance = Math.sqrt(x * x + y * y);
        const fieldStrength = mass / (distance * distance + 0.1);
        
        // Calculate arrow direction (towards center)
        const angle = Math.atan2(y, x);
        
        // Arrow start point
        const startX = centerX + x * scale;
        const startY = centerY + y * scale;
        
        // Arrow end point
        const arrowLength = Math.min(fieldStrength * 20, distance * scale * 0.8);
        const endX = startX - Math.cos(angle) * arrowLength;
        const endY = startY - Math.sin(angle) * arrowLength;
        
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrow head
        const headLength = 5;
        const headAngle = 0.5;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX + headLength * Math.cos(angle + Math.PI - headAngle),
          endY + headLength * Math.sin(angle + Math.PI - headAngle)
        );
        ctx.lineTo(
          endX + headLength * Math.cos(angle + Math.PI + headAngle),
          endY + headLength * Math.sin(angle + Math.PI + headAngle)
        );
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // Draw central mass
    ctx.fillStyle = '#4a90e2';
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.max(5, mass * 5), 0, Math.PI * 2);
    ctx.fill();
  };

  const drawGeodesics = (ctx, centerX, centerY, scale) => {
    const { mass, radius } = parameters;
    
    // Draw several geodesic paths
    const numPaths = 12;
    
    for (let i = 0; i < numPaths; i++) {
      const angle = (i / numPaths) * Math.PI * 2;
      const startX = Math.cos(angle);
      const startY = Math.sin(angle);
      
      // Draw geodesic path
      ctx.strokeStyle = `hsl(${(i / numPaths) * 360}, 80%, 60%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let x = startX;
      let y = startY;
      let vx = -startY * 0.2; // Initial velocity perpendicular to radius
      let vy = startX * 0.2;
      
      ctx.moveTo(centerX + x * scale, centerY + y * scale);
      
      // Simulate geodesic path
      for (let t = 0; t < 200; t++) {
        const distance = Math.sqrt(x * x + y * y);
        
        // Skip if too close to center or too far
        if (distance < 0.1 || distance > 1.5) break;
        
        // Calculate gravitational acceleration
        const acceleration = mass / (distance * distance);
        const angle = Math.atan2(y, x);
        
        // Update velocity (simplified model)
        vx -= Math.cos(angle) * acceleration * 0.01;
        vy -= Math.sin(angle) * acceleration * 0.01;
        
        // Update position
        x += vx * 0.01;
        y += vy * 0.01;
        
        ctx.lineTo(centerX + x * scale, centerY + y * scale);
      }
      
      ctx.stroke();
    }
    
    // Draw central mass
    ctx.fillStyle = '#4a90e2';
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.max(5, mass * 5), 0, Math.PI * 2);
    ctx.fill();
    
    // Draw event horizon
    const eventHorizonRadius = mass * 10;
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, eventHorizonRadius, 0, Math.PI * 2);
    ctx.stroke();
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Einstein Field Equations Visualizer</h1>
        <p>
          Visualize spacetime curvature, gravitational fields, and geodesics based on the Einstein Field Equations.
        </p>
        
        <div className="form-group">
          <label htmlFor="visualizationType">Visualization Type:</label>
          <select
            id="visualizationType"
            className="form-control"
            value={visualizationType}
            onChange={handleTypeChange}
          >
            <option value="spacetime">Spacetime Curvature</option>
            <option value="gravitational">Gravitational Field</option>
            <option value="geodesics">Geodesic Paths</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="mass">Mass (M☉):</label>
          <input
            type="range"
            id="mass"
            name="mass"
            className="form-control"
            value={parameters.mass}
            onChange={handleParameterChange}
            min="0.1"
            max="5"
            step="0.1"
          />
          <span>{parameters.mass} M☉</span>
        </div>
        
        {visualizationType === 'spacetime' && (
          <div className="form-group">
            <label htmlFor="resolution">Grid Resolution:</label>
            <input
              type="range"
              id="resolution"
              name="resolution"
              className="form-control"
              value={parameters.resolution}
              onChange={handleParameterChange}
              min="10"
              max="100"
              step="5"
            />
            <span>{parameters.resolution}</span>
          </div>
        )}
        
        {visualizationType === 'gravitational' && (
          <div className="form-group">
            <label htmlFor="resolution">Arrow Density:</label>
            <input
              type="range"
              id="resolution"
              name="resolution"
              className="form-control"
              value={parameters.resolution}
              onChange={handleParameterChange}
              min="5"
              max="30"
              step="1"
            />
            <span>{parameters.resolution}</span>
          </div>
        )}
        
        {visualizationType === 'geodesics' && (
          <div className="form-group">
            <label htmlFor="radius">Initial Radius:</label>
            <input
              type="range"
              id="radius"
              name="radius"
              className="form-control"
              value={parameters.radius}
              onChange={handleParameterChange}
              min="1"
              max="20"
              step="0.5"
            />
            <span>{parameters.radius}</span>
          </div>
        )}
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          {loading && <p>Rendering visualization...</p>}
          <canvas 
            ref={canvasRef} 
            style={{ 
              maxWidth: '100%', 
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>About this Visualization</h3>
          {visualizationType === 'spacetime' && (
            <p>
              This visualization shows how mass curves spacetime according to Einstein's General Relativity.
              The grid represents spacetime, and the curvature shows how the presence of mass affects the
              geometry of spacetime.
            </p>
          )}
          
          {visualizationType === 'gravitational' && (
            <p>
              This visualization shows the gravitational field around a massive object.
              The arrows represent the direction and strength of the gravitational force at different points.
            </p>
          )}
          
          {visualizationType === 'geodesics' && (
            <p>
              This visualization shows geodesic paths around a massive object.
              Geodesics are the paths that objects follow when moving through curved spacetime.
              The red circle represents the event horizon, where the escape velocity equals the speed of light.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualizer; 