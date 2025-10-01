import React, { useState, useEffect } from 'react';
import { useCrafting } from '../../hooks/useCrafting';
import { CraftingRecipe, CraftingProgress, CraftingMaterial } from '../../types/crafting';
import './CraftingWorkshop.css';

interface CraftingWorkshopProps {
  playerId: string;
  onClose: () => void;
}

export const CraftingWorkshop: React.FC<CraftingWorkshopProps> = ({ playerId, onClose }) => {
  const { 
    recipes, 
    progress, 
    materials, 
    loading, 
    error,
    fetchRecipes,
    fetchProgress,
    fetchMaterials,
    craftItem,
    discoverRecipe,
    upgradeSkill
  } = useCrafting(playerId);

  const [activeTab, setActiveTab] = useState<'recipes' | 'materials' | 'skills' | 'discover'>('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
  const [craftingQuantity, setCraftingQuantity] = useState(1);
  const [discoveryIngredients, setDiscoveryIngredients] = useState<string[]>([]);

  useEffect(() => {
    fetchRecipes();
    fetchProgress();
    fetchMaterials();
  }, [playerId]);

  const handleCraftItem = async () => {
    if (!selectedRecipe) return;
    
    try {
      await craftItem(selectedRecipe.id, craftingQuantity);
      // Refresh data after crafting
      fetchProgress();
      fetchMaterials();
    } catch (error) {
      console.error('Crafting failed:', error);
    }
  };

  const handleDiscoverRecipe = async () => {
    if (discoveryIngredients.length === 0) return;
    
    try {
      await discoverRecipe(discoveryIngredients);
      fetchRecipes();
    } catch (error) {
      console.error('Discovery failed:', error);
    }
  };

  const handleUpgradeSkill = async (skillType: string) => {
    try {
      await upgradeSkill(skillType);
      fetchProgress();
    } catch (error) {
      console.error('Skill upgrade failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="crafting-workshop">
        <div className="loading">Loading crafting workshop...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crafting-workshop">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="crafting-workshop">
      <div className="workshop-header">
        <h2>Crafting Workshop</h2>
        <div className="header-controls">
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>

      <div className="workshop-tabs">
        <button 
          className={activeTab === 'recipes' ? 'active' : ''}
          onClick={() => setActiveTab('recipes')}
        >
          Recipes
        </button>
        <button 
          className={activeTab === 'materials' ? 'active' : ''}
          onClick={() => setActiveTab('materials')}
        >
          Materials
        </button>
        <button 
          className={activeTab === 'skills' ? 'active' : ''}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </button>
        <button 
          className={activeTab === 'discover' ? 'active' : ''}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
      </div>

      <div className="workshop-content">
        {activeTab === 'recipes' && (
          <RecipesTab 
            recipes={recipes || []}
            selectedRecipe={selectedRecipe}
            onSelectRecipe={setSelectedRecipe}
            onCraftItem={handleCraftItem}
            quantity={craftingQuantity}
            onQuantityChange={setCraftingQuantity}
          />
        )}
        {activeTab === 'materials' && (
          <MaterialsTab materials={materials || []} />
        )}
        {activeTab === 'skills' && (
          <SkillsTab 
            progress={progress}
            onUpgradeSkill={handleUpgradeSkill}
          />
        )}
        {activeTab === 'discover' && (
          <DiscoverTab 
            materials={materials || []}
            ingredients={discoveryIngredients}
            onIngredientsChange={setDiscoveryIngredients}
            onDiscover={handleDiscoverRecipe}
          />
        )}
      </div>
    </div>
  );
};

const RecipesTab: React.FC<{
  recipes: CraftingRecipe[];
  selectedRecipe: CraftingRecipe | null;
  onSelectRecipe: (recipe: CraftingRecipe) => void;
  onCraftItem: () => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}> = ({ recipes, selectedRecipe, onSelectRecipe, onCraftItem, quantity, onQuantityChange }) => {
  return (
    <div className="recipes-tab">
      <div className="recipes-grid">
        {recipes.map(recipe => (
          <div 
            key={recipe.id} 
            className={`recipe-card ${selectedRecipe?.id === recipe.id ? 'selected' : ''}`}
            onClick={() => onSelectRecipe(recipe)}
          >
            <div className="recipe-icon">🔨</div>
            <h3>{recipe.name}</h3>
            <p className="recipe-description">{recipe.description}</p>
            <div className="recipe-requirements">
              <div className="skill-requirement">
                Skill Level: {recipe.requiredSkill}
              </div>
              <div className="difficulty">
                Difficulty: {recipe.difficulty}/5
              </div>
            </div>
            <div className="recipe-ingredients">
              <h4>Ingredients:</h4>
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient">
                  {ingredient.name} x{ingredient.quantity}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <div className="crafting-panel">
          <h3>Craft {selectedRecipe.name}</h3>
          <div className="crafting-controls">
            <div className="quantity-control">
              <label>Quantity:</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={quantity}
                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              />
            </div>
            <button onClick={onCraftItem} className="craft-btn">
              Craft Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MaterialsTab: React.FC<{ materials: CraftingMaterial[] }> = ({ materials }) => {
  return (
    <div className="materials-tab">
      <h3>Your Materials</h3>
      <div className="materials-grid">
        {materials.map(material => (
          <div key={material.id} className="material-card">
            <div className="material-icon">📦</div>
            <h4>{material.name}</h4>
            <div className="material-quantity">{material.quantity}</div>
            <div className="material-rarity">{material.rarity}</div>
            <div className="material-category">{material.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SkillsTab: React.FC<{
  progress: CraftingProgress | null;
  onUpgradeSkill: (skillType: string) => void;
}> = ({ progress, onUpgradeSkill }) => {
  if (!progress) return <div>No progress data</div>;

  return (
    <div className="skills-tab">
      <h3>Crafting Skills</h3>
      <div className="skills-grid">
        {Object.entries(progress.skills).map(([skillType, skill]) => (
          <div key={skillType} className="skill-card">
            <h4>{skillType.charAt(0).toUpperCase() + skillType.slice(1)}</h4>
            <div className="skill-level">Level {skill.level}</div>
            <div className="skill-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(skill.experience / skill.maxExperience) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                {skill.experience}/{skill.maxExperience} XP
              </div>
            </div>
            <button 
              onClick={() => onUpgradeSkill(skillType)}
              className="upgrade-btn"
            >
              Upgrade (Cost: {skill.level * 100})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiscoverTab: React.FC<{
  materials: CraftingMaterial[];
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  onDiscover: () => void;
}> = ({ materials, ingredients, onIngredientsChange, onDiscover }) => {
  const toggleIngredient = (materialId: string) => {
    if (ingredients.includes(materialId)) {
      onIngredientsChange(ingredients.filter(id => id !== materialId));
    } else {
      onIngredientsChange([...ingredients, materialId]);
    }
  };

  return (
    <div className="discover-tab">
      <h3>Recipe Discovery</h3>
      <p>Combine different materials to discover new recipes!</p>
      
      <div className="materials-selection">
        <h4>Select Materials:</h4>
        <div className="materials-grid">
          {materials.map(material => (
            <div 
              key={material.id} 
              className={`material-selector ${ingredients.includes(material.id) ? 'selected' : ''}`}
              onClick={() => toggleIngredient(material.id)}
            >
              <div className="material-icon">📦</div>
              <div className="material-name">{material.name}</div>
              <div className="material-quantity">x{material.quantity}</div>
            </div>
          ))}
        </div>
      </div>

      {ingredients.length > 0 && (
        <div className="discovery-panel">
          <h4>Selected Ingredients:</h4>
          <div className="selected-ingredients">
            {ingredients.map(ingredientId => {
              const material = materials.find(m => m.id === ingredientId);
              return material ? (
                <span key={ingredientId} className="selected-ingredient">
                  {material.name}
                </span>
              ) : null;
            })}
          </div>
          <button onClick={onDiscover} className="discover-btn">
            Try Discovery
          </button>
        </div>
      )}
    </div>
  );
};
