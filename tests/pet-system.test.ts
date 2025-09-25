import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PetService } from '../backend/src/services/PetService';
import { Pet, PetSpecies, PetRarity, CareType, TrainingType, BattleType } from '../backend/src/types/pets';

// Mock Socket.io
const mockEmit = vi.fn();
const mockOn = vi.fn();
const mockIo = {
  emit: mockEmit,
  on: mockOn
} as any;

describe('PetService', () => {
  let petService: PetService;
  let mockSocket: any;

  beforeEach(() => {
    mockEmit.mockClear();
    mockOn.mockClear();
    petService = new PetService(mockIo);
    mockSocket = mockIo;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Pet Adoption', () => {
    it('should adopt a new pet successfully', async () => {
      const userId = 'user123';
      const species: PetSpecies = 'cat';
      const name = 'Whiskers';

      const pet = await petService.adoptPet(userId, species, name);

      expect(pet).toBeDefined();
      expect(pet.name).toBe(name);
      expect(pet.species).toBe(species);
      expect(pet.ownerId).toBe(userId);
      expect(pet.level).toBe(1);
      expect(pet.experience).toBe(0);
      expect(pet.stats.health).toBeGreaterThan(0);
      expect(pet.skills.length).toBeGreaterThan(0);
      expect(mockEmit).toHaveBeenCalledWith('pet:adopted', expect.any(Object));
    });

    it('should generate unique pet IDs', async () => {
      const userId = 'user123';
      const pet1 = await petService.adoptPet(userId, 'cat', 'Whiskers');
      const pet2 = await petService.adoptPet(userId, 'dog', 'Buddy');

      expect(pet1.id).not.toBe(pet2.id);
    });

    it('should assign pets to users correctly', async () => {
      const userId = 'user123';
      const pet = await petService.adoptPet(userId, 'cat', 'Whiskers');

      const userPets = await petService.getUserPets(userId);
      expect(userPets).toHaveLength(1);
      expect(userPets[0].id).toBe(pet.id);
    });
  });

  describe('Pet Management', () => {
    let testPet: Pet;

    beforeEach(async () => {
      testPet = await petService.adoptPet('user123', 'cat', 'Whiskers');
    });

    it('should retrieve pet by ID', async () => {
      const retrievedPet = await petService.getPet(testPet.id);
      expect(retrievedPet).toBeDefined();
      expect(retrievedPet?.id).toBe(testPet.id);
    });

    it('should return null for non-existent pet', async () => {
      const nonExistentPet = await petService.getPet('non-existent-id');
      expect(nonExistentPet).toBeNull();
    });

    it('should update pet stats', async () => {
      const newStats = { health: 150, attack: 20 };
      const updatedPet = await petService.updatePetStats(testPet.id, newStats);

      expect(updatedPet).toBeDefined();
      expect(updatedPet?.stats.health).toBe(150);
      expect(updatedPet?.stats.attack).toBe(20);
      expect(mockEmit).toHaveBeenCalledWith('pet:health_changed', expect.any(Object));
    });
  });

  describe('Pet Care System', () => {
    let testPet: Pet;

    beforeEach(async () => {
      testPet = await petService.adoptPet('user123', 'cat', 'Whiskers');
    });

    it('should start a care session', async () => {
      const care = await petService.startCare(testPet.id, 'feeding', 30);

      expect(care).toBeDefined();
      expect(care.petId).toBe(testPet.id);
      expect(care.type).toBe('feeding');
      expect(care.duration).toBe(30);
      expect(care.status).toBe('in_progress');
      expect(mockEmit).toHaveBeenCalledWith('pet:care_started', expect.any(Object));
    });

    it('should complete a care session', async () => {
      const care = await petService.startCare(testPet.id, 'feeding', 30);
      const completedCare = await petService.completeCare(care.id);

      expect(completedCare).toBeDefined();
      expect(completedCare?.status).toBe('completed');
      expect(completedCare?.completedAt).toBeDefined();
      expect(mockEmit).toHaveBeenCalledWith('pet:care_completed', expect.any(Object));
    });

    it('should apply care effects to pet', async () => {
      const initialHunger = testPet.hunger;
      const care = await petService.startCare(testPet.id, 'feeding', 30);
      await petService.completeCare(care.id);

      const updatedPet = await petService.getPet(testPet.id);
      expect(updatedPet?.hunger).toBeGreaterThan(initialHunger);
    });

    it('should throw error for non-existent pet', async () => {
      await expect(petService.startCare('non-existent-id', 'feeding', 30))
        .rejects.toThrow('Pet not found');
    });
  });

  describe('Pet Training System', () => {
    let testPet: Pet;

    beforeEach(async () => {
      testPet = await petService.adoptPet('user123', 'cat', 'Whiskers');
    });

    it('should start a training session', async () => {
      const skillId = testPet.skills[0].id;
      const training = await petService.startTraining(testPet.id, skillId, 'skill');

      expect(training).toBeDefined();
      expect(training.petId).toBe(testPet.id);
      expect(training.skillId).toBe(skillId);
      expect(training.type).toBe('skill');
      expect(training.status).toBe('in_progress');
      expect(mockEmit).toHaveBeenCalledWith('pet:training_started', expect.any(Object));
    });

    it('should complete a training session', async () => {
      const skillId = testPet.skills[0].id;
      const training = await petService.startTraining(testPet.id, skillId, 'skill');
      const completedTraining = await petService.completeTraining(training.id);

      expect(completedTraining).toBeDefined();
      expect(completedTraining?.status).toBe('completed');
      expect(completedTraining?.completedAt).toBeDefined();
      expect(mockEmit).toHaveBeenCalledWith('pet:training_completed', expect.any(Object));
    });

    it('should apply training rewards to pet', async () => {
      const skillId = testPet.skills[0].id;
      const initialSkillExp = testPet.skills[0].experience;
      const training = await petService.startTraining(testPet.id, skillId, 'skill');
      await petService.completeTraining(training.id);

      const updatedPet = await petService.getPet(testPet.id);
      const updatedSkill = updatedPet?.skills.find(s => s.id === skillId);
      expect(updatedSkill?.experience).toBeGreaterThan(initialSkillExp);
    });
  });

  describe('Pet Battle System', () => {
    let pet1: Pet;
    let pet2: Pet;

    beforeEach(async () => {
      pet1 = await petService.adoptPet('user1', 'cat', 'Whiskers');
      pet2 = await petService.adoptPet('user2', 'dog', 'Buddy');
    });

    it('should start a battle between two pets', async () => {
      const battle = await petService.startBattle([pet1.id, pet2.id], 'friendly');

      expect(battle).toBeDefined();
      expect(battle.participants).toHaveLength(2);
      expect(battle.type).toBe('friendly');
      expect(battle.status).toBe('active');
      expect(mockEmit).toHaveBeenCalledWith('pet:battle_started', expect.any(Object));
    });

    it('should execute a battle turn', async () => {
      const battle = await petService.startBattle([pet1.id, pet2.id], 'friendly');
      const participant = battle.participants[0];
      const skill = participant.availableSkills[0];

      const updatedBattle = await petService.executeBattleTurn(
        battle.id,
        participant.id,
        skill.id,
        battle.participants[1].id
      );

      expect(updatedBattle).toBeDefined();
      expect(updatedBattle?.participants[0].stats.skillsUsed).toBe(1);
    });

    it('should end battle when a pet is defeated', async () => {
      const battle = await petService.startBattle([pet1.id, pet2.id], 'friendly');
      const participant = battle.participants[0];
      const skill = participant.availableSkills[0];

      // Simulate multiple turns until one pet is defeated
      let currentBattle = battle;
      for (let i = 0; i < 10; i++) {
        currentBattle = await petService.executeBattleTurn(
          currentBattle.id,
          participant.id,
          skill.id,
          currentBattle.participants[1].id
        ) as any;
        
        if (currentBattle.status === 'completed') {
          break;
        }
      }

      expect(currentBattle.status).toBe('completed');
      expect(currentBattle.winner).toBeDefined();
      expect(mockEmit).toHaveBeenCalledWith('pet:battle_ended', expect.any(Object));
    });
  });

  describe('Pet Marketplace', () => {
    let testPet: Pet;

    beforeEach(async () => {
      testPet = await petService.adoptPet('user123', 'cat', 'Whiskers');
    });

    it('should list a pet for sale', async () => {
      const listing = await petService.listPet(testPet.id, 'user123', 1000, 'sale');

      expect(listing).toBeDefined();
      expect(listing.petId).toBe(testPet.id);
      expect(listing.sellerId).toBe('user123');
      expect(listing.price).toBe(1000);
      expect(listing.type).toBe('sale');
      expect(listing.status).toBe('active');
      expect(mockEmit).toHaveBeenCalledWith('pet:marketplace_listed', expect.any(Object));
    });

    it('should purchase a pet from marketplace', async () => {
      const listing = await petService.listPet(testPet.id, 'user123', 1000, 'sale');
      const purchase = await petService.purchasePet(listing.id, 'buyer456');

      expect(purchase).toBeDefined();
      expect(purchase?.status).toBe('sold');
      expect(purchase?.buyerId).toBe('buyer456');
      expect(purchase?.soldAt).toBeDefined();
      expect(mockEmit).toHaveBeenCalledWith('pet:marketplace_sold', expect.any(Object));
    });

    it('should transfer pet ownership after purchase', async () => {
      const listing = await petService.listPet(testPet.id, 'user123', 1000, 'sale');
      await petService.purchasePet(listing.id, 'buyer456');

      const updatedPet = await petService.getPet(testPet.id);
      expect(updatedPet?.ownerId).toBe('buyer456');
    });

    it('should throw error when listing non-owned pet', async () => {
      await expect(petService.listPet('non-existent-id', 'user123', 1000, 'sale'))
        .rejects.toThrow('Pet not found or not owned');
    });
  });

  describe('Pet Achievements', () => {
    let testPet: Pet;

    beforeEach(async () => {
      testPet = await petService.adoptPet('user123', 'cat', 'Whiskers');
    });

    it('should check and unlock achievements', async () => {
      const achievements = await petService.checkAchievements(testPet.id);

      expect(achievements).toBeDefined();
      expect(Array.isArray(achievements)).toBe(true);
    });

    it('should unlock first pet achievement', async () => {
      const achievements = await petService.checkAchievements(testPet.id);
      const firstPetAchievement = achievements.find(a => a.id === 'first_pet');

      expect(firstPetAchievement).toBeDefined();
      expect(firstPetAchievement?.isUnlocked).toBe(true);
      expect(mockEmit).toHaveBeenCalledWith('pet:achievement_unlocked', expect.any(Object));
    });
  });

  describe('Pet Stats and Progression', () => {
    let testPet: Pet;

    beforeEach(async () => {
      testPet = await petService.adoptPet('user123', 'cat', 'Whiskers');
    });

    it('should have correct base stats for species', () => {
      expect(testPet.stats.health).toBeGreaterThan(0);
      expect(testPet.stats.maxHealth).toBeGreaterThan(0);
      expect(testPet.stats.attack).toBeGreaterThan(0);
      expect(testPet.stats.defense).toBeGreaterThan(0);
      expect(testPet.stats.speed).toBeGreaterThan(0);
    });

    it('should have initial skills', () => {
      expect(testPet.skills.length).toBeGreaterThan(0);
      expect(testPet.skills[0].name).toBe('Basic Attack');
      expect(testPet.skills[0].isUnlocked).toBe(true);
    });

    it('should have personality traits', () => {
      expect(testPet.personality.traits.length).toBeGreaterThan(0);
      expect(testPet.personality.friendliness).toBeGreaterThanOrEqual(0);
      expect(testPet.personality.friendliness).toBeLessThanOrEqual(100);
    });

    it('should have proper care status', () => {
      expect(testPet.happiness).toBe(100);
      expect(testPet.hunger).toBe(100);
      expect(testPet.energy).toBe(100);
      expect(testPet.cleanliness).toBe(100);
    });
  });

  describe('Pet Rarity and Species', () => {
    it('should generate pets with valid rarities', async () => {
      const rarities: PetRarity[] = [];
      
      // Generate multiple pets to test rarity distribution
      for (let i = 0; i < 100; i++) {
        const pet = await petService.adoptPet(`user${i}`, 'cat', `Pet${i}`);
        rarities.push(pet.rarity);
      }

      const validRarities: PetRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine', 'ancient'];
      rarities.forEach(rarity => {
        expect(validRarities).toContain(rarity);
      });
    });

    it('should generate pets with valid species', async () => {
      const species: PetSpecies[] = ['cat', 'dog', 'dragon', 'phoenix', 'wolf'];
      
      for (const speciesType of species) {
        const pet = await petService.adoptPet('user123', speciesType, 'TestPet');
        expect(pet.species).toBe(speciesType);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid pet operations gracefully', async () => {
      await expect(petService.getPet('invalid-id')).resolves.toBeNull();
      await expect(petService.updatePetStats('invalid-id', {})).resolves.toBeNull();
    });

    it('should handle invalid care operations', async () => {
      await expect(petService.startCare('invalid-id', 'feeding', 30))
        .rejects.toThrow('Pet not found');
      await expect(petService.completeCare('invalid-id')).resolves.toBeNull();
    });

    it('should handle invalid training operations', async () => {
      await expect(petService.startTraining('invalid-id', 'skill-id', 'skill'))
        .rejects.toThrow('Pet not found');
      await expect(petService.completeTraining('invalid-id')).resolves.toBeNull();
    });
  });

  describe('Pet Care Scheduler', () => {
    it('should decrease pet stats over time', async () => {
      const pet = await petService.adoptPet('user123', 'cat', 'Whiskers');
      const initialHunger = pet.hunger;

      // Mock time passage
      const originalDate = Date;
      const mockDate = new Date(pet.lastFed.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      global.Date = vi.fn(() => mockDate) as any;

      // Trigger the scheduler manually
      petService['startPetCareScheduler']();

      // Wait for scheduler to run
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedPet = await petService.getPet(pet.id);
      expect(updatedPet?.hunger).toBeLessThan(initialHunger);

      // Restore original Date
      global.Date = originalDate;
    });
  });
});

