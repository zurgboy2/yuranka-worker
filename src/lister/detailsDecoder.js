import { cardHierarchy } from './cardHierarchy.js'; // Adjust the import path as needed

// Hardcoded mappings (from your JSON files)
const rarityMappings = {
  "Ultra Rare": "UR",
  "Rare": "RA",
  "Common": "CO",
  "Super Rare": "SR",
  "Collectors Rare": "CR",
  "Uncommon": "UN",
  "Alternate Art": "AA",
  "Leader": "LE",
  "Token": "TO",
  "Secret Rare": "SR1",
  "Parallel Rare": "PR",
  "Ultimate Rare": "UR1"
};

const locationMappings = {
  "box": "BO",
  "brown binder": "BB",
  "regular binder": "RB",
  "TEST 1": "T1",
  "Test 1": "T11",
  "Price Check": "PC",
  "binder": "BI",
  "safe": "SA",
  "Test NEW": "TN",
  "Test NEW 1": "TN1",
  "TEST NEW 2": "TN2",
  "Test NEW 2": "TN21",
  "Test NEW 3": "TN3",
  "TESTING": "TE",
  "TESTING 2": "T2",
  "TEST 2.1": "T21",
  "neko": "NE",
  "HAHA": "HA",
  "red binder": "RB1"
};

// Reverse the mappings to get code -> human
function reverseMapping(mapping) {
  const reversed = {};
  Object.entries(mapping).forEach(([name, code]) => {
    reversed[code] = name;
  });
  return reversed;
}
const rarityCodeToName = reverseMapping(rarityMappings);
const locationCodeToName = reverseMapping(locationMappings);

// Example TCG config (expand as needed)
// const cardHierarchy = {
//   tcgConfigs: {
//     "default": {
//       variantFields: []
//     },
//     "pokemon": {
//       variantFields: [
//         { name: "firstEdition", type: "boolean", commentCode: "FE" },
//         { name: "reverseHolo", type: "boolean", commentCode: "RH" }
//       ]
//     },
//     "yu-gi-oh": {
//       variantFields: [
//         { name: "firstEdition", type: "boolean", commentCode: "FE" },
//         { name: "construction", type: "selection", commentCode: "CO" }
//       ]
//     }
//     // Add your other TCG configs here
//   }
// };

// Helper for boolean fields (true for "YE", "true", "1")
function decodeVariantValue(value, field) {
  if (field.type === "boolean") {
    return value === "YE" || value === "true" || value === "1";
  }
  return value;
}

// MAIN FUNCTION
export function decodeCardDetails(details, tcgName = "default") {
  const tcgConfig = cardHierarchy.tcgConfigs[tcgName] || cardHierarchy.tcgConfigs["default"];
  const decodedDetails = {};


  // Extract all code:value pairs
  const elements = details.match(/([A-Z]{2}):([^/]+)/g) || [];

  elements.forEach(element => {
    const [code, value] = element.split(':');
    switch(code) {
      case 'RA':
        // Map code to human name (e.g. "UR" -> "Ultra Rare")
        decodedDetails.rarity = rarityCodeToName[value] || value;
        break;
      case 'LO':
        decodedDetails.location = locationCodeToName[value] || value;
        break;
      case 'LA':
        decodedDetails.language = value;
        break;
      case 'QU':
        decodedDetails.quality = value;
        break;
      default:
        // Handle TCG-specific variant fields
        if (tcgConfig.variantFields) {
          tcgConfig.variantFields.forEach(field => {
            if (code === field.commentCode) {
              decodedDetails[field.name] = decodeVariantValue(value, field);
            }
          });
        }
    }
  });

  return decodedDetails;
}

// EXAMPLE USAGE:
const detailLine = "RA:UR/LA:EN/LO:BO/FE:YE/CO:EU/QU:NM";
const decoded = decodeCardDetails(detailLine, "pokemon");
console.log(decoded);
// Output: { rarity: 'Ultra Rare', language: 'EN', location: 'box', firstEdition: true, construction: 'EU', quality: 'NM' }


const TCG_NAME_ALIASES = {
  "mtg": "mtg",
  "magic": "mtg",
  "magic the gathering": "mtg",
  "pokemon": "pokemon",
  "pokémon": "pokemon",
  "yugioh": "yu-gi-oh",
  "yu-gi-oh": "yu-gi-oh",
  "yu gi oh": "yu-gi-oh",
  "ygo": "yu-gi-oh",
  "onepiece": "one-piece",
  "one piece": "one-piece",
  "fab": "fab",
  "flesh and blood": "fab",
  "lorcana": "lorcana",
  "swu": "swu",
  "star wars unlimited": "swu",
  "battle spirit saga": "battle-spirits-saga",
  "battle spirits saga": "battle-spirits-saga",
  "dragonball super": "dragon-ball-super",
  "dragon ball super": "dragon-ball-super",
  "digimon": "digimon"
};

export function normalizeTcgName(input) {
  if (!input) return null;
  const str = input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // keep only a-z and 0-9
  return TCG_NAME_ALIASES[str] || null;
}