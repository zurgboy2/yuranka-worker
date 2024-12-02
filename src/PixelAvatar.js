import React from 'react';
import { 
  Box, 
  IconButton, 
  Grid, 
  Tooltip 
} from '@mui/material';
import { 
  Face, 
  WbSunny, 
  CheckroomOutlined, 
  ContentCut, 
  EmojiEmotions, 
  Accessibility 
} from '@mui/icons-material';

const PixelAvatar = ({ settings, onSettingsChange, status }) => {
  const skinTones = [
    { color: '#FFD5B4', name: 'Light' },
    { color: '#F1C27D', name: 'Medium' },
    { color: '#C68642', name: 'Tan' },
    { color: '#8D5524', name: 'Dark' }
  ];
  
  const outfitColors = [
    { color: '#2196F3', name: 'Blue' },
    { color: '#4CAF50', name: 'Green' },
    { color: '#F44336', name: 'Red' },
    { color: '#9C27B0', name: 'Purple' }
  ];
  
  const hairStyles = [
    { style: 'short', name: 'Short' },
    { style: 'long', name: 'Long' },
    { style: 'curly', name: 'Curly' },
    { style: 'mohawk', name: 'Mohawk' }
  ];

  const accessories = [
    { type: 'glasses', name: 'Glasses' },
    { type: 'hat', name: 'Hat' },
    { type: 'tie', name: 'Tie' }
  ];

  const getHairStyle = (style) => {
    const baseStyle = {
      position: 'absolute',
      backgroundColor: '#000',
      width: '16px',
      height: '6px',
      top: '-2px',
      clipPath: `polygon(
        0% 100%,
        20% 50%,
        40% 100%,
        60% 50%,
        80% 100%,
        100% 50%,
        100% 0%,
        0% 0%
      )`, // Create spiky hair effect
    };
    
    const styles = {
      short: {
        ...baseStyle,
        height: '4px',
      },
      long: {
        ...baseStyle,
        height: '8px',
      },
      curly: {
        ...baseStyle,
        clipPath: `polygon(
          0% 100%,
          25% 0%,
          50% 100%,
          75% 0%,
          100% 100%,
          100% 0%,
          0% 0%
        )`,
      },
      mohawk: {
        ...baseStyle,
        width: '4px',
        height: '8px',
        left: '6px',
      }
    };

    return styles[style] || styles.short;
  };

  const getMood = (status) => {
    const moods = {
      'Checked In': { expression: 'smile', emoji: '😊' },
      'Checked Out': { expression: 'neutral', emoji: '👋' },
      'Going on Break': { expression: 'sleepy', emoji: '😴' },
      'Returning from Break': { expression: 'energetic', emoji: '⚡' }
    };
    return moods[status] || { expression: 'smile', emoji: '😊' };
  };

  const pixelStyles = {
    container: {
      imageRendering: 'pixelated',
      transform: 'scale(3)',
      margin: '50px',
    },
    head: {
      backgroundColor: settings.skinTone,
      width: '16px',
      height: '16px',
      position: 'relative',
      clipPath: `polygon(
        0% 25%, 
        25% 0%, 
        75% 0%, 
        100% 25%,
        100% 75%,
        75% 100%,
        25% 100%,
        0% 75%
      )`,
    },
    face: {
      left: {
        position: 'absolute',
        width: '2px',
        height: '2px',
        backgroundColor: '#000',
        top: '7px',
        left: '5px',
      },
      right: {
        position: 'absolute',
        width: '2px',
        height: '2px',
        backgroundColor: '#000',
        top: '7px',
        right: '5px',
      },
      nose: {
        position: 'absolute',
        width: '4px',
        height: '2px',
        backgroundColor: '#000',
        top: '8px',
        left: '8px',
        transform: 'translateX(-50%)',
      },
      mustache: settings.gender === 'male' ? {
        position: 'absolute',
        width: '10px',
        height: '3px',
        backgroundColor: '#000',
        top: '10px',
        left: '3px',
      } : null,
    },
    body: {
      width: '16px',
      height: '16px',
      position: 'relative',
      backgroundImage: `
        linear-gradient(
          to bottom,
          ${settings.outfitColor} 0%,
          ${settings.outfitColor} 60%,
          #000 60%,
          #000 65%,
          ${settings.outfitColor} 65%,
          ${settings.outfitColor} 100%
        )`,
      clipPath: `polygon(
        25% 0%,
        75% 0%,
        100% 100%,
        0% 100%
      )`,
    },
    overalls: {
      position: 'absolute',
      width: '4px',
      height: '12px',
      backgroundColor: settings.outfitColor,
      top: '0',
      '&.left': {
        left: '3px',
      },
      '&.right': {
        right: '3px',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '3px',
        height: '3px',
        backgroundColor: '#FFD700',
        top: '2px',
      }
    },
    hair: getHairStyle(settings.hairStyle),
    hat: settings.accessories.includes('hat') ? {
      position: 'absolute',
      width: '20px',
      height: '6px',
      backgroundColor: '#FF0000',
      top: '-6px',
      left: '-2px',
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '10px',
        height: '6px',
        backgroundColor: '#FF0000',
        top: '-4px',
        left: '5px',
        borderRadius: '3px 3px 0 0',
      }
    } : null,
    accessories: {
      glasses: {
        position: 'absolute',
        width: '12px',
        height: '4px',
        border: '1px solid #000',
        top: '7px',
        left: '2px',
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '2px',
          height: '1px',
          backgroundColor: '#000',
          top: '1px',
          left: '5px',
        }
      }
    }
  };

  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Box sx={pixelStyles.container}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30 }}>
            {getMood(status).emoji}
          </Box>
          
          <Box sx={{ position: 'relative' }}>
            <Box sx={pixelStyles.head}>
              <Box sx={pixelStyles.hair} />
              <Box sx={pixelStyles.face.left} />
              <Box sx={pixelStyles.face.right} />
              <Box sx={pixelStyles.face.nose} />
              {settings.gender === 'male' && 
                <Box sx={pixelStyles.face.mustache} />
              }
              {settings.accessories.includes('hat') && 
                <Box sx={pixelStyles.hat} />
              }
              {settings.accessories.includes('glasses') && 
                <Box sx={pixelStyles.accessories.glasses} />
              }
            </Box>
            <Box sx={pixelStyles.body}>
              <Box sx={pixelStyles.overalls} className="left" />
              <Box sx={pixelStyles.overalls} className="right" />
            </Box>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Grid item>
          <Tooltip title="Change Gender">
            <IconButton onClick={() => updateSetting('gender', settings.gender === 'male' ? 'female' : 'male')}>
              <Accessibility />
            </IconButton>
          </Tooltip>
        </Grid>
        
        <Grid item>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {skinTones.map(({ color, name }) => (
              <Tooltip key={color} title={name}>
                <IconButton 
                  onClick={() => updateSetting('skinTone', color)}
                  sx={{ 
                    backgroundColor: color,
                    width: 24,
                    height: 24,
                    '&:hover': { backgroundColor: color }
                  }}
                >
                  <WbSunny sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PixelAvatar;