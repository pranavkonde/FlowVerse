'use client';

import { useState, useEffect } from 'react';
import { MapPin, Users } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  x: number;
  y: number;
  isOnline: boolean;
}

interface MinimapProps {
  players: Player[];
  currentPlayer: Player | null;
  isOpen: boolean;
  onToggle: () => void;
  mapWidth?: number;
  mapHeight?: number;
}

export default function Minimap({ 
  players, 
  currentPlayer, 
  isOpen, 
  onToggle, 
  mapWidth = 1200, 
  mapHeight = 800 
}: MinimapProps) {
  const [scale, setScale] = useState(0.2);
  const minimapSize = 200;

  const scaleX = minimapSize / mapWidth;
  const scaleY = minimapSize / mapHeight;

  const getPlayerColor = (player: Player) => {
    if (player.id === currentPlayer?.id) return '#3b82f6'; // Blue for current player
    if (!player.isOnline) return '#6b7280'; // Gray for offline
    return '#ef4444'; // Red for other players
  };

  const getPlayerPosition = (player: Player) => {
    return {
      x: player.x * scaleX,
      y: player.y * scaleY
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 w-52 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-white font-medium text-sm">Minimap</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Users className="w-3 h-3" />
            <span>{players.length}</span>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="relative bg-slate-900 rounded border border-slate-600 overflow-hidden" style={{ width: minimapSize, height: minimapSize }}>
        {/* Map Background Grid */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: Math.ceil(mapWidth / 100) }, (_, i) => (
            <div
              key={`v-${i}`}
              className="absolute bg-slate-600"
              style={{
                left: (i * 100) * scaleX,
                top: 0,
                width: 1,
                height: minimapSize
              }}
            />
          ))}
          {Array.from({ length: Math.ceil(mapHeight / 100) }, (_, i) => (
            <div
              key={`h-${i}`}
              className="absolute bg-slate-600"
              style={{
                left: 0,
                top: (i * 100) * scaleY,
                width: minimapSize,
                height: 1
              }}
            />
          ))}
        </div>

        {/* Buildings/Environment */}
        <div className="absolute inset-0">
          {/* NYC Buildings representation */}
          <div
            className="absolute bg-slate-600 rounded-sm"
            style={{
              left: 200 * scaleX,
              top: 200 * scaleY,
              width: 100 * scaleX,
              height: 150 * scaleY
            }}
          />
          <div
            className="absolute bg-slate-600 rounded-sm"
            style={{
              left: 400 * scaleX,
              top: 300 * scaleY,
              width: 120 * scaleX,
              height: 180 * scaleY
            }}
          />
          <div
            className="absolute bg-slate-600 rounded-sm"
            style={{
              left: 600 * scaleX,
              top: 150 * scaleY,
              width: 80 * scaleX,
              height: 200 * scaleY
            }}
          />
          <div
            className="absolute bg-slate-600 rounded-sm"
            style={{
              left: 800 * scaleX,
              top: 250 * scaleY,
              width: 100 * scaleX,
              height: 160 * scaleY
            }}
          />
        </div>

        {/* DeFi Agents */}
        <div className="absolute">
          <div
            className="absolute w-2 h-2 bg-green-500 rounded-full"
            style={{
              left: 300 * scaleX - 1,
              top: 400 * scaleY - 1
            }}
            title="Token Swap"
          />
          <div
            className="absolute w-2 h-2 bg-green-500 rounded-full"
            style={{
              left: 500 * scaleX - 1,
              top: 500 * scaleY - 1
            }}
            title="Price Check"
          />
          <div
            className="absolute w-2 h-2 bg-green-500 rounded-full"
            style={{
              left: 700 * scaleX - 1,
              top: 350 * scaleY - 1
            }}
            title="Transfer"
          />
        </div>

        {/* Players */}
        {players.map((player) => {
          const position = getPlayerPosition(player);
          return (
            <div
              key={player.id}
              className="absolute w-3 h-3 rounded-full border border-white"
              style={{
                left: position.x - 1.5,
                top: position.y - 1.5,
                backgroundColor: getPlayerColor(player)
              }}
              title={player.username}
            />
          );
        })}

        {/* Current Player Indicator */}
        {currentPlayer && (
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white animate-pulse"
            style={{
              left: getPlayerPosition(currentPlayer).x - 2,
              top: getPlayerPosition(currentPlayer).y - 2,
              backgroundColor: getPlayerColor(currentPlayer)
            }}
          />
        )}
      </div>

      <div className="mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>You</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Others</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Agents</span>
          </div>
        </div>
      </div>
    </div>
  );
}
