'use client';

import { useState } from 'react';
import { Activity, Zap, Cpu, Wifi, TrendingUp } from 'lucide-react';
import { usePerformance } from '@/hooks/usePerformance';

interface PerformanceMonitorProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function PerformanceMonitor({ isVisible, onToggle }: PerformanceMonitorProps) {
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getPerformanceScore,
    getPerformanceLevel
  } = usePerformance();

  const performanceLevel = getPerformanceLevel();
  const performanceScore = getPerformanceScore();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 w-80 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700 p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">Performance</span>
        </div>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Performance Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm">Overall Score</span>
          <span className={`text-sm font-medium ${getLevelColor(performanceLevel)}`}>
            {performanceLevel.toUpperCase()}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(performanceScore)}`}
            style={{ width: `${performanceScore}%` }}
          />
        </div>
        <div className="text-slate-400 text-xs mt-1">
          {performanceScore}/100
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-300 text-sm">FPS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-mono">
              {metrics.fps}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              metrics.fps >= 60 ? 'bg-green-400' :
              metrics.fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
          </div>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300 text-sm">Memory</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-mono">
              {metrics.memoryUsage}MB
            </span>
            <div className={`w-2 h-2 rounded-full ${
              metrics.memoryUsage < 100 ? 'bg-green-400' :
              metrics.memoryUsage < 200 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
          </div>
        </div>

        {/* Render Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-slate-300 text-sm">Render</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-mono">
              {metrics.renderTime}ms
            </span>
            <div className={`w-2 h-2 rounded-full ${
              metrics.renderTime < 16 ? 'bg-green-400' :
              metrics.renderTime < 32 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
          </div>
        </div>

        {/* Network Latency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 text-sm">Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-mono">
              {metrics.networkLatency}ms
            </span>
            <div className={`w-2 h-2 rounded-full ${
              metrics.networkLatency < 100 ? 'bg-green-400' :
              metrics.networkLatency < 200 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <button
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          className={`w-full py-2 px-4 rounded transition-colors ${
            isMonitoring
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>

      {/* Performance Tips */}
      <div className="mt-3 text-xs text-slate-400">
        <div className="font-medium mb-1">Tips:</div>
        <div>• Close other tabs to improve FPS</div>
        <div>• Use Chrome for best performance</div>
        <div>• Check your internet connection</div>
      </div>
    </div>
  );
}
