export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  task: string;
  reward: {
    tokens: number;
    items?: string[];
  };
  requiredActions: string[];
  nextStepId?: string;
}

export class TutorialService {
  private static readonly TUTORIAL_STEPS: { [key: string]: TutorialStep } = {
    'welcome': {
      id: 'welcome',
      title: 'Welcome to FlowVerse',
      description: 'Learn the basics of the game and earn rewards!',
      task: 'Click the "Next" button to continue',
      reward: { tokens: 50 },
      requiredActions: ['click_next'],
      nextStepId: 'movement'
    },
    'movement': {
      id: 'movement',
      title: 'Basic Movement',
      description: 'Learn how to move your character',
      task: 'Use WASD or arrow keys to move around',
      reward: { tokens: 100 },
      requiredActions: ['move_up', 'move_down', 'move_left', 'move_right'],
      nextStepId: 'inventory'
    },
    'inventory': {
      id: 'inventory',
      title: 'Inventory Management',
      description: 'Learn how to manage your inventory',
      task: 'Open your inventory and equip the starter weapon',
      reward: { tokens: 150, items: ['starter_sword'] },
      requiredActions: ['open_inventory', 'equip_item'],
      nextStepId: 'combat'
    },
    'combat': {
      id: 'combat',
      title: 'Basic Combat',
      description: 'Learn how to fight enemies',
      task: 'Defeat the training dummy',
      reward: { tokens: 200, items: ['health_potion'] },
      requiredActions: ['attack_enemy', 'defeat_enemy'],
      nextStepId: 'complete'
    },
    'complete': {
      id: 'complete',
      title: 'Tutorial Complete',
      description: 'Congratulations! You\'ve completed the basic tutorial',
      task: 'Claim your final reward',
      reward: { tokens: 500, items: ['tutorial_completion_badge'] },
      requiredActions: ['claim_reward']
    }
  };

  private userProgress: Map<string, { currentStepId: string; completedActions: Set<string> }> = new Map();

  async getCurrentStep(userId: string): Promise<TutorialStep> {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      // Start new tutorial
      this.userProgress.set(userId, {
        currentStepId: 'welcome',
        completedActions: new Set()
      });
      return TutorialService.TUTORIAL_STEPS['welcome'];
    }
    return TutorialService.TUTORIAL_STEPS[progress.currentStepId];
  }

  async completeAction(userId: string, action: string): Promise<{
    stepCompleted: boolean;
    tutorialCompleted: boolean;
    reward?: typeof TutorialStep.prototype.reward;
  }> {
    const progress = this.userProgress.get(userId);
    if (!progress) return { stepCompleted: false, tutorialCompleted: false };

    const currentStep = TutorialService.TUTORIAL_STEPS[progress.currentStepId];
    if (!currentStep.requiredActions.includes(action)) {
      return { stepCompleted: false, tutorialCompleted: false };
    }

    progress.completedActions.add(action);

    // Check if all required actions are completed
    const allActionsCompleted = currentStep.requiredActions.every(
      reqAction => progress.completedActions.has(reqAction)
    );

    if (allActionsCompleted) {
      const tutorialCompleted = !currentStep.nextStepId;
      if (!tutorialCompleted) {
        // Move to next step
        this.userProgress.set(userId, {
          currentStepId: currentStep.nextStepId!,
          completedActions: new Set()
        });
      }

      return {
        stepCompleted: true,
        tutorialCompleted,
        reward: currentStep.reward
      };
    }

    return { stepCompleted: false, tutorialCompleted: false };
  }

  async resetTutorial(userId: string): Promise<void> {
    this.userProgress.delete(userId);
  }
}

export const tutorialService = new TutorialService();
