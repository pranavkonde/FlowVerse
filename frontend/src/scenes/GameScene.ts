import Phaser from 'phaser';
import { Player } from '@/types/game';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private otherPlayers!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private emoteKey!: Phaser.Input.Keyboard.Key;
  private voiceKey!: Phaser.Input.Keyboard.Key;
  private playerText!: Phaser.GameObjects.Text;
  private background!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Create simple colored rectangles for players
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    // Create a simple background pattern
    this.load.image('background', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create background
    this.background = this.add.tileSprite(0, 0, width, height, 'background');
    this.background.setTint(0x1e293b);

    // Create player group for other players
    this.otherPlayers = this.physics.add.group();

    // Create main player
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setDisplaySize(32, 32);
    this.player.setTint(0x3b82f6); // Blue color
    this.player.setCollideWorldBounds(true);

    // Add player name text
    this.playerText = this.add.text(width / 2, height / 2 - 40, 'You', {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.playerText.setOrigin(0.5);

    // Set up input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    this.emoteKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.voiceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Set up camera to follow player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1);

    // Create some basic environment elements
    this.createEnvironment();

    // Set up physics
    this.physics.world.setBounds(0, 0, width * 2, height * 2);
  }

  private createEnvironment() {
    const { width, height } = this.cameras.main;

    // Create some buildings (simple rectangles)
    const buildings = [
      { x: 200, y: 200, width: 100, height: 150 },
      { x: 400, y: 300, width: 120, height: 180 },
      { x: 600, y: 150, width: 80, height: 200 },
      { x: 800, y: 250, width: 100, height: 160 },
    ];

    buildings.forEach(building => {
      const rect = this.add.rectangle(building.x, building.y, building.width, building.height, 0x475569);
      rect.setStrokeStyle(2, 0x64748b);
      
      // Add some windows
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
          const window = this.add.rectangle(
            building.x - building.width/2 + 20 + j * 20,
            building.y - building.height/2 + 20 + i * 30,
            15, 20, 0x1e293b
          );
        }
      }
    });

    // Create some DeFi agent locations
    this.createDeFiAgents();
  }

  private createDeFiAgents() {
    const agents = [
      { x: 300, y: 400, name: 'Token Swap', type: 'swap' },
      { x: 500, y: 500, name: 'Price Check', type: 'price' },
      { x: 700, y: 350, name: 'Transfer', type: 'transfer' },
    ];

    agents.forEach(agent => {
      const agentSprite = this.add.circle(agent.x, agent.y, 20, 0x10b981);
      agentSprite.setStrokeStyle(3, 0x059669);
      
      const agentText = this.add.text(agent.x, agent.y - 40, agent.name, {
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 1
      });
      agentText.setOrigin(0.5);

      // Make it interactive
      agentSprite.setInteractive();
      agentSprite.on('pointerdown', () => {
        console.log(`Interacting with ${agent.name} agent`);
        // TODO: Implement agent interaction
      });
    });
  }

  update() {
    // Handle player movement
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = speed;
    }

    this.player.setVelocity(velocityX, velocityY);

    // Update player text position
    this.playerText.setPosition(this.player.x, this.player.y - 40);

    // Handle emote
    if (Phaser.Input.Keyboard.JustDown(this.emoteKey)) {
      this.showEmote('wave');
    }

    // Handle voice command
    if (Phaser.Input.Keyboard.JustDown(this.voiceKey)) {
      this.startVoiceCommand();
    }
  }

  private showEmote(emoteType: string) {
    const emotes = {
      wave: '👋',
      heart: '❤️',
      fire: '🔥',
      money: '💰'
    };

    const emote = this.add.text(this.player.x, this.player.y - 60, emotes[emoteType as keyof typeof emotes] || '👋', {
      fontSize: '24px'
    });
    emote.setOrigin(0.5);

    // Animate emote
    this.tweens.add({
      targets: emote,
      y: emote.y - 30,
      alpha: 0,
      duration: 2000,
      onComplete: () => emote.destroy()
    });
  }

  private startVoiceCommand() {
    console.log('Starting voice command...');
    // TODO: Implement voice recognition
  }

  public addOtherPlayer(playerData: Player) {
    const otherPlayer = this.physics.add.sprite(playerData.x, playerData.y, 'player');
    otherPlayer.setDisplaySize(32, 32);
    otherPlayer.setTint(0xef4444); // Red color for other players
    otherPlayer.setCollideWorldBounds(true);

    const playerName = this.add.text(playerData.x, playerData.y - 40, playerData.username, {
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    playerName.setOrigin(0.5);

    // Store reference for updates
    (otherPlayer as any).playerId = playerData.id;
    (otherPlayer as any).playerName = playerName;

    this.otherPlayers.add(otherPlayer);
  }

  public updateOtherPlayer(playerId: string, x: number, y: number) {
    this.otherPlayers.children.entries.forEach((player: any) => {
      if (player.playerId === playerId) {
        player.setPosition(x, y);
        player.playerName.setPosition(x, y - 40);
      }
    });
  }

  public removeOtherPlayer(playerId: string) {
    this.otherPlayers.children.entries.forEach((player: any) => {
      if (player.playerId === playerId) {
        player.playerName.destroy();
        player.destroy();
      }
    });
  }

  public handleMobileMove(direction: 'up' | 'down' | 'left' | 'right') {
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;

    switch (direction) {
      case 'left':
        velocityX = -speed;
        break;
      case 'right':
        velocityX = speed;
        break;
      case 'up':
        velocityY = -speed;
        break;
      case 'down':
        velocityY = speed;
        break;
    }

    this.player.setVelocity(velocityX, velocityY);
  }
}
