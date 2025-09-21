export interface CharacterCustomization {
  id: string;
  name: string;
  category: 'avatar' | 'clothing' | 'accessories' | 'colors' | 'animations';
  items: CustomizationItem[];
  selectedItem?: string;
}

export interface CustomizationItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  isUnlocked: boolean;
  isEquipped: boolean;
  category: string;
  tags: string[];
  stats?: {
    speed?: number;
    charisma?: number;
    luck?: number;
  };
}

export interface CharacterProfile {
  id: string;
  username: string;
  level: number;
  experience: number;
  coins: number;
  avatar: string;
  clothing: {
    hat?: string;
    shirt?: string;
    pants?: string;
    shoes?: string;
  };
  accessories: {
    glasses?: string;
    watch?: string;
    necklace?: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  animations: {
    walk: string;
    idle: string;
    emote: string;
  };
  unlockedItems: string[];
  equippedItems: string[];
}

export const CUSTOMIZATION_CATEGORIES: CharacterCustomization[] = [
  {
    id: 'avatar',
    name: 'Avatar',
    description: 'Choose your character appearance',
    category: 'avatar',
    items: []
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Dress up your character',
    category: 'clothing',
    items: []
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Add accessories and jewelry',
    category: 'accessories',
    items: []
  },
  {
    id: 'colors',
    name: 'Colors',
    description: 'Customize color schemes',
    category: 'colors',
    items: []
  },
  {
    id: 'animations',
    name: 'Animations',
    description: 'Choose movement and emote styles',
    category: 'animations',
    items: []
  }
];

export const CUSTOMIZATION_ITEMS: CustomizationItem[] = [
  // Avatars
  {
    id: 'avatar_default',
    name: 'Default Avatar',
    description: 'The classic Free Flow avatar',
    icon: '👤',
    rarity: 'common',
    price: 0,
    isUnlocked: true,
    isEquipped: true,
    category: 'avatar',
    tags: ['default', 'classic']
  },
  {
    id: 'avatar_robot',
    name: 'Robot Avatar',
    description: 'A futuristic robot character',
    icon: '🤖',
    rarity: 'rare',
    price: 500,
    isUnlocked: false,
    isEquipped: false,
    category: 'avatar',
    tags: ['futuristic', 'tech'],
    stats: { speed: 5 }
  },
  {
    id: 'avatar_ninja',
    name: 'Ninja Avatar',
    description: 'A stealthy ninja warrior',
    icon: '🥷',
    rarity: 'epic',
    price: 1000,
    isUnlocked: false,
    isEquipped: false,
    category: 'avatar',
    tags: ['stealth', 'warrior'],
    stats: { speed: 10, charisma: 5 }
  },
  {
    id: 'avatar_wizard',
    name: 'Wizard Avatar',
    description: 'A mystical wizard character',
    icon: '🧙',
    rarity: 'legendary',
    price: 2000,
    isUnlocked: false,
    isEquipped: false,
    category: 'avatar',
    tags: ['magic', 'mystical'],
    stats: { charisma: 15, luck: 10 }
  },

  // Clothing - Hats
  {
    id: 'hat_cap',
    name: 'Baseball Cap',
    description: 'A classic baseball cap',
    icon: '🧢',
    rarity: 'common',
    price: 100,
    isUnlocked: false,
    isEquipped: false,
    category: 'clothing',
    tags: ['casual', 'sport']
  },
  {
    id: 'hat_crown',
    name: 'Golden Crown',
    description: 'A majestic golden crown',
    icon: '👑',
    rarity: 'legendary',
    price: 5000,
    isUnlocked: false,
    isEquipped: false,
    category: 'clothing',
    tags: ['royal', 'luxury'],
    stats: { charisma: 20 }
  },
  {
    id: 'hat_helmet',
    name: 'Space Helmet',
    description: 'A futuristic space helmet',
    icon: '🪖',
    rarity: 'epic',
    price: 1500,
    isUnlocked: false,
    isEquipped: false,
    category: 'clothing',
    tags: ['space', 'futuristic'],
    stats: { speed: 5 }
  },

  // Clothing - Shirts
  {
    id: 'shirt_t_shirt',
    name: 'T-Shirt',
    description: 'A comfortable cotton t-shirt',
    icon: '👕',
    rarity: 'common',
    price: 50,
    isUnlocked: false,
    isEquipped: false,
    category: 'clothing',
    tags: ['casual', 'comfortable']
  },
  {
    id: 'shirt_suit',
    name: 'Business Suit',
    description: 'A professional business suit',
    icon: '👔',
    rarity: 'rare',
    price: 800,
    isUnlocked: false,
    isEquipped: false,
    category: 'clothing',
    tags: ['professional', 'formal'],
    stats: { charisma: 10 }
  },
  {
    id: 'shirt_armor',
    name: 'Knight Armor',
    description: 'Heavy protective armor',
    icon: '🛡️',
    rarity: 'epic',
    price: 2000,
    isUnlocked: false,
    isEquipped: false,
    category: 'clothing',
    tags: ['armor', 'protection'],
    stats: { speed: -5, charisma: 15 }
  },

  // Accessories
  {
    id: 'glasses_sunglasses',
    name: 'Sunglasses',
    description: 'Cool sunglasses',
    icon: '🕶️',
    rarity: 'common',
    price: 200,
    isUnlocked: false,
    isEquipped: false,
    category: 'accessories',
    tags: ['cool', 'style']
  },
  {
    id: 'watch_gold',
    name: 'Gold Watch',
    description: 'An expensive gold watch',
    icon: '⌚',
    rarity: 'rare',
    price: 1000,
    isUnlocked: false,
    isEquipped: false,
    category: 'accessories',
    tags: ['luxury', 'time'],
    stats: { charisma: 8 }
  },
  {
    id: 'necklace_diamond',
    name: 'Diamond Necklace',
    description: 'A sparkling diamond necklace',
    icon: '💎',
    rarity: 'legendary',
    price: 3000,
    isUnlocked: false,
    isEquipped: false,
    category: 'accessories',
    tags: ['luxury', 'sparkle'],
    stats: { charisma: 25, luck: 15 }
  },

  // Colors
  {
    id: 'color_blue',
    name: 'Ocean Blue',
    description: 'A calming ocean blue theme',
    icon: '🔵',
    rarity: 'common',
    price: 0,
    isUnlocked: true,
    isEquipped: true,
    category: 'colors',
    tags: ['calm', 'ocean']
  },
  {
    id: 'color_fire',
    name: 'Fire Red',
    description: 'A passionate fire red theme',
    icon: '🔴',
    rarity: 'rare',
    price: 300,
    isUnlocked: false,
    isEquipped: false,
    category: 'colors',
    tags: ['passion', 'fire']
  },
  {
    id: 'color_rainbow',
    name: 'Rainbow',
    description: 'A vibrant rainbow theme',
    icon: '🌈',
    rarity: 'epic',
    price: 800,
    isUnlocked: false,
    isEquipped: false,
    category: 'colors',
    tags: ['vibrant', 'rainbow']
  },

  // Animations
  {
    id: 'walk_normal',
    name: 'Normal Walk',
    description: 'Standard walking animation',
    icon: '🚶',
    rarity: 'common',
    price: 0,
    isUnlocked: true,
    isEquipped: true,
    category: 'animations',
    tags: ['normal', 'standard']
  },
  {
    id: 'walk_swagger',
    name: 'Swagger Walk',
    description: 'A confident swagger walk',
    icon: '🕺',
    rarity: 'rare',
    price: 500,
    isUnlocked: false,
    isEquipped: false,
    category: 'animations',
    tags: ['confident', 'cool'],
    stats: { charisma: 10 }
  },
  {
    id: 'walk_float',
    name: 'Float Walk',
    description: 'A mystical floating walk',
    icon: '🧚',
    rarity: 'epic',
    price: 1200,
    isUnlocked: false,
    isEquipped: false,
    category: 'animations',
    tags: ['mystical', 'magic'],
    stats: { charisma: 15, luck: 5 }
  }
];
