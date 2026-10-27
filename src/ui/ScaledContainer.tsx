/**
 * Responsive 16:9 Scaled Container for 1280x720 logical resolution.
 * Automatically computes CSS scale factor and Centers the HUD precisely over the Phaser canvas.
 */

import React, { useEffect, useState } from 'react';

interface ScaledContainerProps {
  children: React.ReactNode;
}

export const ScaledContainer: React.FC<ScaledContainerProps> = ({ children }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // 1280 x 720 base resolution
      const targetRatio = 1280 / 720;
      const windowRatio = windowWidth / windowHeight;

      let computedScale: number;
      if (windowRatio < targetRatio) {
        // Limited by width
        computedScale = windowWidth / 1280;
      } else {
        // Limited by height
        computedScale = windowHeight / 720;
      }

      setScale(computedScale);
      document.documentElement.style.setProperty('--scale-factor', computedScale.toString());
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <div
        style={{
          width: 1280,
          height: 720,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="relative pointer-events-auto overflow-hidden select-none"
      >
        {children}
      </div>
    </div>
  );
};
