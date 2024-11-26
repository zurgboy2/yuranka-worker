const tcgConfig = [
  { 
    name: 'Magic: The Gathering', 
    imageUrl: 'https://ik.imagekit.io/mcgszbooe/M1.jpg?updatedAt=1723031170168',
    stockCollectionName: 'mtg',
    existingStockCollectionName: 'mtg_existing_stock',
    background: {
      type: 'image',
      value: 'https://ik.imagekit.io/mcgszbooe/M1.jpg?updatedAt=1723031170168'
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Mythic Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'foil', type: 'boolean' },
      { name: 'language', type: 'selection', options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  { 
    name: 'Pokemon', 
    imageUrl: 'https://ik.imagekit.io/mcgszbooe/Pokemon_fb_1.jpg?updatedAt=1708283575415',
    stockCollectionName: 'pokemon',
    existingStockCollectionName: 'pokemon_existing_stock',
    background: {
      type: 'image',
      value: 'https://ik.imagekit.io/mcgszbooe/Pokemon_fb_1.jpg?updatedAt=1708283575415'  // Pokemon yellow
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Ultra Rare', 'Secret Rare', 'Rainbow Rare', 'Hyper Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'firstEdition', type: 'boolean' },
      { name: 'reverseHolo', type: 'boolean' },
      { name: 'language', type: 'selection', options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  { 
    name: 'Yu-Gi-Oh!', 
    imageUrl: 'https://ik.imagekit.io/mcgszbooe/Y2.jpg?updatedAt=1709207356017',
    stockCollectionName: 'yu-gi-oh',
    existingStockCollectionName: 'yu-gi-oh_existing_stock',
    background: {
      type: 'image',
      value: 'https://ik.imagekit.io/mcgszbooe/Y2.jpg?updatedAt=1709207356017'
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Secret Rare', 'Ultimate Rare', 'Ghost Rare', 'Starlight Rare','Parallel Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'firstEdition', type: 'boolean' },
      { name: 'construction', type: 'selection', options: ['American', 'European'] },
      { name: 'language', type: 'selection', options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish', 'Korean'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  { 
    name: 'One Piece', 
    imageUrl: 'https://ik.imagekit.io/mcgszbooe/O2.png?updatedAt=1709212376860',
    stockCollectionName: 'one-piece',
    existingStockCollectionName: 'one-piece_existing_stock',
    background: {
      type: 'image',
      value: 'https://ik.imagekit.io/mcgszbooe/O2.png?updatedAt=1709212376860'
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare', 'Leader Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'language', type: 'selection', options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  {
    name: 'Flesh and Blood',
    imageUrl: 'https://ik.imagekit.io/mcgszbooe/FAB.jpg?updatedAt=1730565998814',
    stockCollectionName: 'fab',
    existingStockCollectionName: 'fab_existing_stock',
    background: {
      type: 'image',
      value: 'https://ik.imagekit.io/mcgszbooe/FAB.jpg?updatedAt=1730565998814'  // Dark red
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Rare', 'Super Rare', 'Majestic', 'Legendary', 'Fabled'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'language', type: 'selection', options: ['English'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  {
    name: 'Disney Lorcana',
    imageUrl: 'https://example.com/lorcana.png',
    stockCollectionName: 'lorcana',
    existingStockCollectionName: 'lorcana_existing_stock',
    background: {
      type: 'color',
      value: '#4B0082'  // Deep purple
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Legendary'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'foil', type: 'boolean' },
      { name: 'language', type: 'selection', options: ['English', 'French', 'German'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  {
    name: 'Star Wars Unlimited',
    imageUrl: 'https://example.com/swu.png',
    stockCollectionName: 'swu',
    existingStockCollectionName: 'swu_existing_stock',
    background: {
      type: 'color',
      value: '#000000'  
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Legendary'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'foil', type: 'boolean' },
      { name: 'language', type: 'selection', options: ['English'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  {
    name: 'Battle Spirits Saga',
    imageUrl: 'https://example.com/bss.png',
    stockCollectionName: 'bss',
    existingStockCollectionName: 'bss_existing_stock',
    background: {
      type: 'color',
      value: '#FF4500'  
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Master Rare', 'X Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'foil', type: 'boolean' },
      { name: 'language', type: 'selection', options: ['English', 'Japanese'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  {
    name: 'Dragon Ball Super Card Game',
    imageUrl: 'https://example.com/dbs.png',
    stockCollectionName: 'dbs_stock',
    existingStockCollectionName: 'dbs_existing_stock',
    background: {
      type: 'color',
      value: '#FFA500'  // Orange
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare', 'Special Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'foil', type: 'boolean' },
      { name: 'language', type: 'selection', options: ['English', 'Japanese', 'French', 'Italian', 'Spanish'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  {
    name: 'Digimon Card Game',
    imageUrl: 'https://example.com/digimon.png',
    stockCollectionName: 'digimon',
    existingStockCollectionName: 'digimon_existing_stock',
    background: {
      type: 'color',
      value: '#4169E1'  // Royal Blue
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'language', type: 'selection', options: ['English', 'Japanese'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'avg7', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
];

export default tcgConfig;