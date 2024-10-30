const tcgConfig = [
  { 
    name: 'Magic: The Gathering', 
    imageUrl: 'https://example.com/mtg.png',
    stockCollectionName: 'mtg_stock',
    existingStockCollectionName: 'mtg_existing_stock',
    background: {
      type: 'image',
      value: 'https://example.com/mtg-background.jpg'
    },
    headers: [] // To be filled in later
  },
  { 
    name: 'Pokemon', 
    imageUrl: 'https://example.com/pokemon.png',
    stockCollectionName: 'pokemon_stock',
    existingStockCollectionName: 'pokemon_existing_stock',
    background: {
      type: 'color',
      value: '#FFCB05'  // Pokemon yellow
    },
    headers: [
      { name: 'name', type: 'text' },
      { name: 'expansion', type: 'text' },
      { name: 'collectorNumber', type: 'text' },
      { name: 'expansionCode', type: 'text' },
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Secret Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'firstEdition', type: 'boolean' },
      { name: 'reverseHolo', type: 'boolean' },
      { name: 'language', type: 'selection', options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
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
      { name: 'rarity', type: 'selection', options: ['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Secret Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'firstEdition', type: 'boolean' },
      { name: 'construction', type: 'selection', options: ['American', 'European'] },
      { name: 'language', type: 'selection', options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish', 'Korean'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
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
      { name: 'rarity', type: 'selection', options: ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare'] },
      { name: 'cardmarketId', type: 'number' },
      { name: 'language', type: 'selection', options: ['English', 'Japanese', 'French', 'German', 'Italian', 'Spanish'] },
      { name: 'quality', type: 'selection', options: ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO'] },
      { name: 'quantity', type: 'number' },
      { name: 'price', type: 'number' },
      { name: 'location', type: 'text' },
    ]
  },
  // Add more TCGs as needed
];

export default tcgConfig;