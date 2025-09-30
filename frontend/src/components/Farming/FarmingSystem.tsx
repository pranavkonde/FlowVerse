import React, { useState } from 'react';
import { Plot, Crop, PLOT_STATUS_COLORS, SEASON_COLORS, QUALITY_LEVELS } from '../../types/farming';
import { useFarming } from '../../hooks/useFarming';

export const FarmingSystem: React.FC = () => {
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const {
    plots,
    availableCrops,
    loading,
    error,
    createPlot,
    tillPlot,
    plantCrop,
    waterCrop,
    fertilizeCrop,
    harvestCrop
  } = useFarming();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading farming system: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Farm</h2>
        <button
          onClick={() => createPlot({ x: 0, y: 0 })}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Create New Plot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Your Plots</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {plots.map((plot) => (
              <PlotCard
                key={plot.id}
                plot={plot}
                onClick={() => setSelectedPlot(plot)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Available Crops</h3>
          <div className="grid grid-cols-2 gap-4">
            {availableCrops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onClick={() => setSelectedCrop(crop)}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedPlot && (
        <PlotModal
          plot={selectedPlot}
          selectedCrop={selectedCrop}
          onClose={() => {
            setSelectedPlot(null);
            setSelectedCrop(null);
          }}
          onTill={(toolId) => tillPlot(selectedPlot.id, toolId)}
          onPlant={() => selectedCrop && plantCrop(selectedPlot.id, selectedCrop.id)}
          onWater={() => waterCrop(selectedPlot.id)}
          onFertilize={(fertilizerId) => fertilizeCrop(selectedPlot.id, fertilizerId)}
          onHarvest={() => harvestCrop(selectedPlot.id)}
        />
      )}
    </div>
  );
};

const PlotCard: React.FC<{
  plot: Plot;
  onClick: () => void;
}> = ({ plot, onClick }) => {
  const statusColor = PLOT_STATUS_COLORS[plot.status];
  
  return (
    <div
      onClick={onClick}
      className={`bg-${statusColor}-700 rounded-lg p-4 cursor-pointer hover:bg-${statusColor}-600 transition-colors`}
    >
      <div className="relative h-32">
        {plot.crop && (
          <img
            src={plot.crop.currentStage >= 0 ? plot.crop.stages[plot.crop.currentStage].imageUrl : ''}
            alt="Crop"
            className="absolute inset-0 w-full h-full object-cover rounded"
          />
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-sm bg-${statusColor}-500 text-white`}>
            {plot.status}
          </span>
        </div>
      </div>

      {plot.crop && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Quality:</span>
            <span className={`text-${getQualityColor(plot.crop.quality)}-400`}>
              {plot.crop.quality}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Stage:</span>
            <span className="text-white">
              {plot.crop.stages[plot.crop.currentStage].name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const CropCard: React.FC<{
  crop: Crop;
  onClick: () => void;
}> = ({ crop, onClick }) => {
  const seasonColors = SEASON_COLORS[crop.season as keyof typeof SEASON_COLORS] || SEASON_COLORS.spring;
  
  return (
    <div
      onClick={onClick}
      className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
      style={{
        background: `linear-gradient(135deg, ${seasonColors.join(', ')})`
      }}
    >
      <div className="relative h-24">
        <img
          src={crop.stages[0].imageUrl}
          alt={crop.name}
          className="absolute inset-0 w-full h-full object-cover rounded"
        />
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 rounded text-sm bg-black bg-opacity-50 text-white">
            {crop.season}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <h4 className="text-lg font-semibold text-white">{crop.name}</h4>
        <p className="text-sm text-gray-200">{crop.description}</p>
        
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-200">Growth Time:</span>
            <span className="text-white">{formatTime(crop.growthTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-200">Yield:</span>
            <span className="text-white">{crop.yield.baseQuantity}x {crop.yield.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlotModal: React.FC<{
  plot: Plot;
  selectedCrop: Crop | null;
  onClose: () => void;
  onTill: (toolId: string) => Promise<void>;
  onPlant: () => Promise<void>;
  onWater: () => Promise<void>;
  onFertilize: (fertilizerId: string) => Promise<void>;
  onHarvest: () => Promise<void>;
}> = ({
  plot,
  selectedCrop,
  onClose,
  onTill,
  onPlant,
  onWater,
  onFertilize,
  onHarvest
}) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">
            Plot {plot.position.x}, {plot.position.y}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {plot.status === 'empty' && (
            <button
              onClick={() => handleAction(() => onTill('basic_hoe'))}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Tilling...' : 'Till Plot'}
            </button>
          )}

          {plot.status === 'tilled' && selectedCrop && (
            <button
              onClick={() => handleAction(onPlant)}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Planting...' : `Plant ${selectedCrop.name}`}
            </button>
          )}

          {plot.status === 'planted' && plot.crop && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Growth Progress:</span>
                  <span className="text-white">
                    Stage {plot.crop.currentStage + 1} of {plot.crop.stages.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Quality:</span>
                  <span className={`text-${getQualityColor(plot.crop.quality)}-400`}>
                    {plot.crop.quality}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleAction(onWater)}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Watering...' : 'Water Crop'}
              </button>

              <button
                onClick={() => handleAction(() => onFertilize('basic_fertilizer'))}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Fertilizing...' : 'Apply Fertilizer'}
              </button>
            </>
          )}

          {plot.status === 'ready' && (
            <button
              onClick={() => handleAction(onHarvest)}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? 'Harvesting...' : 'Harvest Crop'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function getQualityColor(quality: number): string {
  for (const [level, { min, max, color }] of Object.entries(QUALITY_LEVELS)) {
    if (quality >= min && quality <= max) {
      return color;
    }
  }
  return QUALITY_LEVELS.poor.color;
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
