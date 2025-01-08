const tcgConfig = {
  // Common configurations used across all TCGs
  commonFields: {
    required: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'cardmarketId', type: 'number' }
    ],
    variants: [
      { 
        name: 'quality', 
        type: 'selection', 
        options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO']
      },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'location', type: 'text' }
    ],
    display: {
      defaultColumns: ['name', 'expansion', 'price', 'quantity'],
      computedFields: ['avg7']
    }
  },

  // Individual TCG configurations
  games: {
    mtg: {
      name: 'Magic: The Gathering',
      collectionNames: {
        stock: 'mtg',
        existing: 'mtg_existing_stock'
      },
      display: {
        imageUrl: 'https://ik.imagekit.io/mcgszbooe/M1.jpg?updatedAt=1723031170168',
        background: {
          type: 'image',
          value: 'https://ik.imagekit.io/mcgszbooe/M1.jpg?updatedAt=1723031170168'
        }
      },
      variantFields: [
        { name: 'foil', type: 'boolean' }
      ],
      rarity: {
        options: ['Common', 'Uncommon', 'Rare', 'Mythic Rare']
      },
      language: {
        options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish']
      }
    },

    pokemon: {
      name: 'Pokemon',
      collectionNames: {
        stock: 'pokemon',
        existing: 'pokemon_existing_stock'
      },
      display: {
        imageUrl: 'https://ik.imagekit.io/mcgszbooe/Pokemon_fb_1.jpg?updatedAt=1708283575415',
        background: {
          type: 'image',
          value: 'https://ik.imagekit.io/mcgszbooe/Pokemon_fb_1.jpg?updatedAt=1708283575415'
        }
      },
      variantFields: [
        { name: 'firstEdition', type: 'boolean' },
        { name: 'reverseHolo', type: 'boolean' }
      ],
      rarity: {
        options: ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Ultra Rare', 'Secret Rare', 'Rainbow Rare', 'Hyper Rare']
      },
      language: {
        options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish']
      }
    },

    'yu-gi-oh': {
      name: 'Yu-Gi-Oh!',
      collectionNames: {
        stock: 'yu-gi-oh',
        existing: 'yu-gi-oh_existing_stock'
      },
      display: {
        imageUrl: 'https://ik.imagekit.io/mcgszbooe/Y2.jpg?updatedAt=1709207356017',
        background: {
          type: 'image',
          value: 'https://ik.imagekit.io/mcgszbooe/Y2.jpg?updatedAt=1709207356017'
        }
      },
      variantFields: [
        { name: 'firstEdition', type: 'boolean' },
        { 
          name: 'construction', 
          type: 'selection', 
          options: ['American', 'European'] 
        }
      ],
      rarity: {
        options: ['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Secret Rare', 'Ultimate Rare', 'Ghost Rare', 'Starlight Rare', 'Parallel Rare']
      },
      language: {
        options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish', 'Korean']
      }
    },

    'one-piece': {
      name: 'One Piece',
      collectionNames: {
        stock: 'one-piece',
        existing: 'one-piece_existing_stock'
      },
      display: {
        imageUrl: 'https://ik.imagekit.io/mcgszbooe/O2.png?updatedAt=1709212376860',
        background: {
          type: 'image',
          value: 'https://ik.imagekit.io/mcgszbooe/O2.png?updatedAt=1709212376860'
        }
      },
      variantFields: [],
      rarity: {
        options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare', 'Leader Rare']
      },
      language: {
        options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish']
      }
    },

    fab: {
      name: 'Flesh and Blood',
      collectionNames: {
        stock: 'fab',
        existing: 'fab_existing_stock'
      },
      display: {
        imageUrl: 'https://ik.imagekit.io/mcgszbooe/FAB.jpg?updatedAt=1730565998814',
        background: {
          type: 'image',
          value: 'https://ik.imagekit.io/mcgszbooe/FAB.jpg?updatedAt=1730565998814'
        }
      },
      variantFields: [],
      rarity: {
        options: ['Common', 'Rare', 'Super Rare', 'Majestic', 'Legendary', 'Fabled']
      },
      language: {
        options: ['English']
      }
    },

    lorcana: {
      name: 'Disney Lorcana',
      collectionNames: {
        stock: 'lorcana',
        existing: 'lorcana_existing_stock'
      },
      display: {
        imageUrl: 'https://example.com/lorcana.png',
        background: {
          type: 'color',
          value: '#4B0082'
        }
      },
      variantFields: [
        { name: 'foil', type: 'boolean' }
      ],
      rarity: {
        options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Legendary']
      },
      language: {
        options: ['English', 'French', 'German']
      }
    },

    swu: {
      name: 'Star Wars Unlimited',
      collectionNames: {
        stock: 'swu',
        existing: 'swu_existing_stock'
      },
      display: {
        imageUrl: 'https://example.com/swu.png',
        background: {
          type: 'color',
          value: '#000000'
        }
      },
      variantFields: [
        { name: 'foil', type: 'boolean' }
      ],
      rarity: {
        options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Legendary']
      },
      language: {
        options: ['English']
      }
    },

    'battle-spirits-saga': {
      name: 'Battle Spirits Saga',
      collectionNames: {
        stock: 'battle-spirits-saga',
        existing: 'battle-spirits-saga_existing_stock'
      },
      display: {
        imageUrl: 'https://example.com/bss.png',
        background: {
          type: 'color',
          value: '#FF4500'
        }
      },
      variantFields: [
        { name: 'foil', type: 'boolean' }
      ],
      rarity: {
        options: ['Common', 'Uncommon', 'Rare', 'Master Rare', 'X Rare']
      },
      language: {
        options: ['English', 'Japanese']
      }
    },

    'dragon-ball-super': {
      name: 'Dragon Ball Super Card Game',
      collectionNames: {
        stock: 'dragon-ball-super',
        existing: 'dragon-ball-super_existing_stock'
      },
      display: {
        imageUrl: 'https://example.com/dbs.png',
        background: {
          type: 'color',
          value: '#FFA500'
        }
      },
      variantFields: [
        { name: 'foil', type: 'boolean' }
      ],
      rarity: {
        options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare', 'Special Rare']
      },
      language: {
        options: ['English', 'Japanese', 'French', 'Italian', 'Spanish']
      }
    },

    digimon: {
      name: 'Digimon Card Game',
      collectionNames: {
        stock: 'digimon',
        existing: 'digimon_existing_stock'
      },
      display: {
        imageUrl: 'https://example.com/digimon.png',
        background: {
          type: 'color',
          value: '#4169E1'
        }
      },
      variantFields: [],
      rarity: {
        options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare']
      },
      language: {
        options: ['English', 'Japanese']
      }
    }
  }
};

export default tcgConfig;