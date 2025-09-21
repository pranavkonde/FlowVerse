import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  networkLatency: number;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    networkLatency: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  const measureFPS = useCallback(() => {
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (isMonitoring) {
        requestAnimationFrame(measureFrame);
      }
    };

    if (isMonitoring) {
      requestAnimationFrame(measureFrame);
    }
  }, [isMonitoring]);

  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      }));
    }
  }, []);

  const measureNetworkLatency = useCallback(async () => {
    const start = performance.now();
    
    try {
      await fetch('/api/ping', { method: 'HEAD' });
      const latency = performance.now() - start;
      
      setMetrics(prev => ({
        ...prev,
        networkLatency: Math.round(latency)
      }));
    } catch (error) {
      // Fallback to a simple measurement
      setMetrics(prev => ({
        ...prev,
        networkLatency: 0
      }));
    }
  }, []);

  const measureRenderTime = useCallback(() => {
    const start = performance.now();
    
    // Force a re-render and measure time
    requestAnimationFrame(() => {
      const renderTime = performance.now() - start;
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.round(renderTime)
      }));
    });
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const getPerformanceScore = useCallback((): number => {
    let score = 100;
    
    // FPS scoring (target: 60fps)
    if (metrics.fps < 30) score -= 30;
    else if (metrics.fps < 45) score -= 15;
    else if (metrics.fps < 60) score -= 5;
    
    // Memory scoring (target: < 100MB)
    if (metrics.memoryUsage > 200) score -= 20;
    else if (metrics.memoryUsage > 150) score -= 10;
    else if (metrics.memoryUsage > 100) score -= 5;
    
    // Render time scoring (target: < 16ms)
    if (metrics.renderTime > 32) score -= 20;
    else if (metrics.renderTime > 16) score -= 10;
    
    // Network latency scoring (target: < 100ms)
    if (metrics.networkLatency > 500) score -= 15;
    else if (metrics.networkLatency > 200) score -= 10;
    else if (metrics.networkLatency > 100) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }, [metrics]);

  const getPerformanceLevel = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' => {
    const score = getPerformanceScore();
    
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }, [getPerformanceScore]);

  useEffect(() => {
    if (isMonitoring) {
      measureFPS();
      
      const memoryInterval = setInterval(measureMemory, 1000);
      const networkInterval = setInterval(measureNetworkLatency, 5000);
      const renderInterval = setInterval(measureRenderTime, 2000);
      
      return () => {
        clearInterval(memoryInterval);
        clearInterval(networkInterval);
        clearInterval(renderInterval);
      };
    }
  }, [isMonitoring, measureFPS, measureMemory, measureNetworkLatency, measureRenderTime]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getPerformanceScore,
    getPerformanceLevel
  };
}
