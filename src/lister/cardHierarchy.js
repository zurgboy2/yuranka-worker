export const cardHierarchy = {
  // Level 1: Primary identifiers (used for grouping/document_id)
  primaryIdentifiers: [
    "expansionCode",
    "language",
    "rarity"
  ],
  
  // Level 2: Common variant fields (used across all TCGs)
  commonVariantFields: [
    {
      name: "quality",
      type: "selection",
      options: ["MT", "NM", "EX", "GD", "LP", "PL", "PO"],
      commentCode: "QU",
      modifiers: {
        "MT": 10,
        "NM": 1.1,
        "EX": 0.9,
        "GD": 0.8,
        "LP": 0.6,
        "PL": 0.4,
        "PO": 0.2
      }
    },
    {
      name: "location",
      type: "text",
      commentCode: "LO"
    },
    {
      name: "price",
      type: "number"
    },
    {
      name: "quantity",
      type: "number"
    }
  ],

  // Level 3: TCG-specific configurations (including variant fields and options)
  tcgConfigs: {
    "mtg": {
      folderId: '1uwlgaXAEA2_csXA3ExGj6gju4gT-M89E',
      collectionNames: {
        stock: 'mtg',
        existing: 'mtg_existing_stock'
      },
      variantFields: [
        {
          name: "foil",
          type: "boolean",
          commentCode: "FO",
          modifiers: {
            true: 1.25,  
            false: 1
          }
        }
      ],
      rarity: {
        options: ["Common", "Uncommon", "Rare", "Mythic Rare"],
        commentCode: "RA"
      },
      language: {
        options: ["English", "Japanese", "French", "German", "Italian", "Spanish"],
        commentCode: "LA"
      }
    },
    "pokemon": {
      folderId: '1BxbfltTo20UV_PxgKLHlgT06yjV3NY0y',
      collectionNames: {
        stock: 'pokemon',
        existing: 'pokemon_existing_stock'
      },
      variantFields: [
        {
          name: "firstEdition",
          type: "boolean",
          commentCode: "FE",
          modifiers: {
            true: 1.25,  
            false: 1
          }
        },
        {
          name: "reverseHolo",
          type: "boolean",
          commentCode: "RH",
          modifiers: {
            true: 1.25,  
            false: 1
          }
        }
      ],
      rarity: {
        options: ["Common", "Uncommon", "Rare", "Rare Holo", "Ultra Rare", "Secret Rare", "Rainbow Rare", "Hyper Rare"],
        commentCode: "RA"
      },
      language: {
        options: ["English", "Japanese", "French", "German", "Italian", "Spanish"],
        commentCode: "LA"
      }
    },
    "yu-gi-oh": {
      folderId: '1uP9fUVV71tjy3RULjHzkJkARxZ8ILFhr',
      collectionNames: {
        stock: 'yu-gi-oh',
        existing: 'yu-gi-oh_existing_stock'
      },
      variantFields: [
        {
          name: "firstEdition",
          type: "boolean",
          commentCode: "FE",
          modifiers: {
            true: 1.25,  
            false: 1
          }
        },
        {
          name: "construction",
          type: "selection",
          options: ["American", "European"],
          commentCode: "CO",
          modifiers: {
            true: 1.25,  
            false: 1
          }
        }
      ],
      rarity: {
        options: ["Common", "Rare", "Super Rare", "Ultra Rare", "Secret Rare", "Ultimate Rare", "Ghost Rare", "Starlight Rare"],
        commentCode: "RA"
      },
      language: {
        options: ["English", "Japanese", "French", "German", "Italian", "Spanish", "Korean"],
        commentCode: "LA"
      }
    },
    "one-piece": {
      folderId: '1MaS1wyVaofMJk0KuzBldpPTXSefJR8d0',
      collectionNames: {
        stock: 'one-piece',
        existing: 'one-piece_existing_stock'
      },
      variantFields: [],
      rarity: {
        options: ["Common", "Uncommon", "Rare", "Super Rare", "Secret Rare", "Leader Rare"],
        commentCode: "RA"
      },
      language: {
        options: ["English", "Japanese", "French", "German", "Italian", "Spanish"],
        commentCode: "LA"
      }
    },
    "fab": {
      folderId: '[YOUR_FOLDER_ID]',
      collectionNames: {
        stock: 'fab',
        existing: 'fab_existing_stock'
      },
      variantFields: [],
      rarity: {
        options: ["Common", "Rare", "Super Rare", "Majestic", "Legendary", "Fabled"],
        commentCode: "RA"
      },
      language: {
        options: ["English"],
        commentCode: "LA"
      }
    },
    "lorcana": {
      folderId: '[YOUR_FOLDER_ID]',
      collectionNames: {
        stock: 'lorcana',
        existing: 'lorcana_existing_stock'
      },
      variantFields: [
        {
          name: "foil",
          type: "boolean",
          commentCode: "FO",
          modifiers: {
            true: 1.25,  
            false: 1
          }
        }
      ],
      rarity: {
        options: ["Common", "Uncommon", "Rare", "Super Rare", "Legendary"],
        commentCode: "RA"
      },
      language: {
        options: ["English", "French", "German"],
        commentCode: "LA"
      }
    },
    "swu": {
      folderId: '[YOUR_FOLDER_ID]',
      collectionNames: {
        stock: 'swu',
        existing: 'swu_existing_stock'
      },
      variantFields: [
        {
          name: "foil",
          type: "boolean",
          commentCode: "FO",
          modifiers: {
            true: 1.25,  
            false: 1
          }
        }
      ],
      rarity: {
        options: ["Common", "Uncommon", "Rare", "Super Rare", "Legendary"],
        commentCode: "RA"
      },
      language: {
        options: ["English"],
        commentCode: "LA"
      }
    },
    "battle-spirits-saga": {
      folderId: '[YOUR_FOLDER_ID]',
      collectionNames: {
        stock: 'battle-spirits-saga',
        existing: 'battle-spirits-saga_existing_stock'
      },
      variantFields: [
        {
          name: "foil",
          type: "boolean",
          commentCode: "FO",
          modifiers: {
            true: 1.25,  
            false: 1
          }
        }
      ],
      rarity: {
        options: ["Common", "Uncommon", "Rare", "Master Rare", "X Rare"],
        commentCode: "RA"
      },
      language: {
        options: ["English", "Japanese"],
        commentCode: "LA"
      }
    },
    "dragon-ball-super": {
      folderId: '[YOUR_FOLDER_ID]',
      collectionNames: {
        stock: 'dragon-ball-super',
        existing: 'dragon-ball-super_existing_stock'
      },
      variantFields: [
        {
          name: "foil",
          type: "boolean",
          commentCode: "FO",
          modifiers: {
            true: 1.25,  
            false: 1
          }
        }
      ],
      rarity: {
        options: ["Common", "Uncommon", "Rare", "Super Rare", "Secret Rare", "Special Rare"],
        commentCode: "RA"
      },
      language: {
        options: ["English", "Japanese", "French", "Italian", "Spanish"],
        commentCode: "LA"
      }
    },
    "digimon": {
      folderId: '[YOUR_FOLDER_ID]',
      collectionNames: {
        stock: 'digimon',
        existing: 'digimon_existing_stock'
      },
      variantFields: [],
      rarity: {
        options: ["Common", "Uncommon", "Rare", "Super Rare", "Secret Rare"],
        commentCode: "RA"
      },
      language: {
        options: ["English", "Japanese"],
        commentCode: "LA"
      }
    }
  }

};