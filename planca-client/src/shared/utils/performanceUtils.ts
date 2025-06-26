/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Start measuring performance for a specific operation
   */
  startMeasure(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
    
    console.log(`⏱️ Started measuring: ${name}`, metadata);
  }

  /**
   * End measuring performance and log results
   */
  endMeasure(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`❌ No performance metric found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;

    // Color code based on performance
    const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴';
    
    console.log(`${color} Performance: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);

    return duration;
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, PerformanceMetric> {
    const summary: Record<string, PerformanceMetric> = {};
    
    this.metrics.forEach((metric, name) => {
      if (metric.duration !== undefined) {
        summary[name] = metric;
      }
    });

    return summary;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring API call performance
 */
export const measureApiCall = (name: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.startMeasure(`API_${name}`, { args });
      
      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitor.endMeasure(`API_${name}`);
        return result;
      } catch (error) {
        performanceMonitor.endMeasure(`API_${name}`);
        throw error;
      }
    };

    return descriptor;
  };
};

/**
 * Measure React component render performance
 */
export const measureRender = (componentName: string) => {
  const measureName = `RENDER_${componentName}`;
  
  return {
    start: () => performanceMonitor.startMeasure(measureName),
    end: () => performanceMonitor.endMeasure(measureName)
  };
};

/**
 * Measure cache operations
 */
export const measureCacheOperation = (operation: string, details?: Record<string, any>) => {
  const measureName = `CACHE_${operation}`;
  
  return {
    start: () => performanceMonitor.startMeasure(measureName, details),
    end: () => performanceMonitor.endMeasure(measureName)
  };
};

/**
 * Monitor memory usage
 */
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    };
  }
  return null;
};

/**
 * Log current performance metrics
 */
export const logPerformanceMetrics = () => {
  const summary = performanceMonitor.getSummary();
  const memory = getMemoryUsage();
  
  console.group('📊 Performance Metrics');
  
  if (Object.keys(summary).length > 0) {
    console.table(Object.values(summary).map(metric => ({
      Name: metric.name,
      Duration: `${metric.duration?.toFixed(2)}ms`,
      Status: metric.duration! < 100 ? '✅ Fast' : metric.duration! < 500 ? '⚠️ Medium' : '❌ Slow'
    })));
  } else {
    console.log('No performance metrics available');
  }
  
  if (memory) {
    console.log('Memory Usage:', `${memory.used}MB / ${memory.total}MB (${memory.usage}%)`);
  }
  
  console.groupEnd();
};

/**
 * Debounced performance logging
 */
let logTimeout: NodeJS.Timeout;
export const logPerformanceMetricsDebounced = (delay: number = 2000) => {
  clearTimeout(logTimeout);
  logTimeout = setTimeout(logPerformanceMetrics, delay);
};

/**
 * Watch for performance issues
 */
export const watchPerformance = () => {
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported');
    return;
  }

  // Watch for long tasks
  const longTaskObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.warn(`🐌 Long task detected: ${entry.duration.toFixed(2)}ms`);
    });
  });

  try {
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    console.warn('Long task observation not supported');
  }

  // Watch for layout shifts
  const clsObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry: any) => {
      if (entry.value > 0.1) {
        console.warn(`📐 Layout shift detected: ${entry.value.toFixed(4)}`);
      }
    });
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    console.warn('Layout shift observation not supported');
  }
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Performance monitoring initialized');
    watchPerformance();
    
    // Log metrics every 30 seconds
    setInterval(logPerformanceMetrics, 30000);
  }
}; 