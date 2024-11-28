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
      backgroundColor: '#000',
      position: 'absolute',
    };
    
    const styles = {
      short: {
        ...baseStyle,
        height: '10px',
        width: '44px',
        top: '-5px',
        borderRadius: '5px'
      },
      long: {
        ...baseStyle,
        height: '50px',
        width: '44px',
        top: '-5px',
        borderRadius: '5px 5px 10px 10px'
      },
      curly: {
        ...baseStyle,
        height: '30px',
        width: '44px',
        top: '-5px',
        borderRadius: '50%'
      },
      mohawk: {
        ...baseStyle,
        height: '20px',
        width: '6px',
        top: '-15px',
        left: '17px'
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
    head: {
      backgroundColor: settings.skinTone,
      width: '40px',
      height: '40px',
      borderRadius: '20px',
      position: 'relative',
    },
    body: {
      backgroundColor: settings.outfitColor,
      width: '60px',
      height: '70px',
      borderRadius: '10px',
    },
    hair: getHairStyle(settings.hairStyle),
    accessories: {
      glasses: {
        position: 'absolute',
        width: '30px',
        height: '10px',
        border: '2px solid #000',
        top: '15px',
        left: '5px',
        borderRadius: '5px'
      }
    }
  };

  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30 }}>
          {getMood(status).emoji}
        </Box>
        
        {/* Avatar Display */}
        <Box sx={{ position: 'relative' }}>
          <Box sx={pixelStyles.head}>
            <Box sx={pixelStyles.hair} />
            {settings.accessories.includes('glasses') && 
              <Box sx={pixelStyles.accessories.glasses} />
            }
          </Box>
          <Box sx={pixelStyles.body} />
        </Box>
      </Box>

      {/* Customization Controls */}
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
        
        {/* Additional customization controls */}
      </Grid>
    </Box>
  );
};

export default PixelAvatar;