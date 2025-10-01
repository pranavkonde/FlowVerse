import React, { useState } from 'react';
import { useFarming } from '../../hooks/useFarming';
import { FarmPlot, CropTemplate, PlotStatus, GrowthStage } from '../../types/farming';

const GROWTH_STAGE_ICONS = {
  SEED: '🌱',
  SPROUT: '🌿',
  GROWING: '🌾',
  FLOWERING: '🌸',
  MATURE: '🌽'
};

const PLOT_STATUS_COLORS = {
  EMPTY: 'bg-gray-700',
  TILLED: 'bg-brown-600',
  PLANTED: 'bg-green-900',
  GROWING: 'bg-green-700',
  HARVESTABLE: 'bg-yellow-600',
  DISEASED: 'bg-red-900'
};

export function FarmingSystem() {
  const {
    plots,
    availableCrops,
    stats,
    loading,
    error,
    createPlot,
    tillPlot,
    plantCrop,
    waterPlot,
    fertilizePlot,
    harvestCrop
  } = useFarming();

  const [selectedPlot, setSelectedPlot] = useState<FarmPlot | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropTemplate | null>(null);
  const [showStats, setShowStats] = useState(false);

  if (loading) {
    return <div className="p-4">Loading farming system...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const handlePlotAction = async (plot: FarmPlot) => {
    try {
      if (plot.status === 'EMPTY') {
        await tillPlot(plot.id, 'basic-hoe'); // Using a basic tool ID
      } else if (plot.status === 'TILLED' && selectedCrop) {
        await plantCrop(plot.id, selectedCrop.name);
        setSelectedCrop(null);
      } else if (plot.status === 'PLANTED' || plot.status === 'GROWING') {
        if (plot.moisture < 70) {
          await waterPlot(plot.id, 'basic-watering-can');
        }
        if (plot.fertility < 70) {
          await fertilizePlot(plot.id, 'basic-fertilizer');
        }
      } else if (plot.status === 'HARVESTABLE') {
        const result = await harvestCrop(plot.id, 'basic-basket');
        // Show harvest result notification
        alert(`Harvested ${result.yield} crops of ${result.quality} quality!`);
      }
    } catch (err) {
      console.error('Error performing plot action:', err);
    }
  };

  const renderPlot = (plot: FarmPlot) => (
    <div
      key={plot.id}
      className={`
        ${PLOT_STATUS_COLORS[plot.status]}
        w-24 h-24 rounded-lg m-2 cursor-pointer
        flex flex-col items-center justify-center
        transition-all duration-200
        hover:ring-2 hover:ring-blue-500
        ${selectedPlot?.id === plot.id ? 'ring-2 ring-blue-500' : ''}
      `}
      onClick={() => setSelectedPlot(plot)}
      onDoubleClick={() => handlePlotAction(plot)}
    >
      {plot.crop && (
        <div className="text-2xl">
          {GROWTH_STAGE_ICONS[plot.crop.growthStage]}
        </div>
      )}
      <div className="text-xs text-white mt-1">
        {plot.status}
      </div>
      {(plot.status === 'PLANTED' || plot.status === 'GROWING') && (
        <div className="flex space-x-1 mt-1">
          <div
            className="w-2 h-4 bg-blue-500 rounded"
            style={{ height: `${plot.moisture / 25}rem` }}
          />
          <div
            className="w-2 h-4 bg-green-500 rounded"
            style={{ height: `${plot.fertility / 25}rem` }}
          />
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold text-white mb-2">Farming Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-white">
          <span className="block text-gray-400">Total Harvests</span>
          {stats.totalHarvests}
        </div>
        <div className="text-white">
          <span className="block text-gray-400">Perfect Crops</span>
          {stats.perfectCrops}
        </div>
        <div className="text-white">
          <span className="block text-gray-400">Total Earnings</span>
          {stats.totalEarnings} coins
        </div>
      </div>
    </div>
  );

  const renderCropSelection = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold text-white mb-2">Available Crops</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {availableCrops.map(crop => (
          <div
            key={crop.name}
            className={`
              bg-gray-700 rounded p-2 cursor-pointer
              ${selectedCrop?.name === crop.name ? 'ring-2 ring-blue-500' : ''}
            `}
            onClick={() => setSelectedCrop(crop)}
          >
            <div className="text-white font-semibold">{crop.name}</div>
            <div className="text-sm text-gray-400">
              Growth: {crop.growthTime}m
            </div>
            <div className="text-sm text-gray-400">
              Value: {crop.value} coins
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Your Farm</h1>
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {showStats && renderStats()}
      {renderCropSelection()}

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {plots.map(renderPlot)}
        <div
          className="w-24 h-24 border-2 border-dashed border-gray-600 rounded-lg m-2 flex items-center justify-center cursor-pointer hover:border-blue-500"
          onClick={() => createPlot({ x: plots.length * 2, y: 0 })}
        >
          <span className="text-2xl text-gray-600">+</span>
        </div>
      </div>

      {selectedPlot && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-2">Plot Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-white">
              <span className="block text-gray-400">Status</span>
              {selectedPlot.status}
            </div>
            <div className="text-white">
              <span className="block text-gray-400">Soil Type</span>
              {selectedPlot.soil}
            </div>
            <div className="text-white">
              <span className="block text-gray-400">Moisture</span>
              {selectedPlot.moisture}%
            </div>
            <div className="text-white">
              <span className="block text-gray-400">Fertility</span>
              {selectedPlot.fertility}%
            </div>
          </div>
          {selectedPlot.crop && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Crop Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-white">
                  <span className="block text-gray-400">Name</span>
                  {selectedPlot.crop.name}
                </div>
                <div className="text-white">
                  <span className="block text-gray-400">Growth Stage</span>
                  {selectedPlot.crop.growthStage}
                </div>
                <div className="text-white">
                  <span className="block text-gray-400">Planted</span>
                  {new Date(selectedPlot.crop.plantedAt).toLocaleDateString()}
                </div>
                <div className="text-white">
                  <span className="block text-gray-400">Harvestable</span>
                  {new Date(selectedPlot.crop.harvestableAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}