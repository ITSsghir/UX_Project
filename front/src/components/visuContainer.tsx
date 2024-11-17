import React, { useRef, useEffect, useState } from 'react';
import '../styles/visu.css';

interface VisuContainerProps {
  children: (dimensions: { width: number; height: number }) => JSX.Element;
}

const VisuContainer: React.FC<VisuContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Adjust padding as needed
        setDimensions({
          width: clientWidth - 20, // Example padding of 20px
          height: clientHeight - 20, // Example padding of 20px
        });
      }
    };

    // Initial size calculation
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="visu-container">
      {children(dimensions)}
    </div>
  );
};

export default VisuContainer;
