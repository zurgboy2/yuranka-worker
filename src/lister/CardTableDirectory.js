import React from 'react';
import ResponsiveEditableCardTable from './ResponsiveEditableCardTable';
import ResponsiveEditableVariantCardTable from './ResponsiveEditableVariantCardTable';

const CardTableDirectory = ({ cards, headers, onSave, mode, collectionName }) => {
  const hasVariants = cards.some(card => card.variants && card.variants.length > 0);

  if (hasVariants) {
    return (
      <ResponsiveEditableVariantCardTable
        cards={cards}
        headers={headers}
        onSave={onSave}
        mode={mode}
        collectionName={collectionName}
      />
    );
  } else {
    return (
      <ResponsiveEditableCardTable
        cards={cards}
        headers={headers}
        onSave={onSave}
        mode={mode}
        collectionName={collectionName}
      />
    );
  }
};

export default CardTableDirectory;