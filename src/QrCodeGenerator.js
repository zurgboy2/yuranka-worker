import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/system';
import apiCall from './api';
import { useUserData } from './UserContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#222',
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  textAlign: 'center',
  width: '300px',
  position: 'relative',
  overflow: 'hidden',
}));

const StyledForm = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const StyledInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#f00',
    },
    '&:hover fieldset': {
      borderColor: '#f00',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#f00',
    },
  },
  '& .MuiInputBase-input': {
    color: '#f00',
  },
  '& .MuiInputLabel-root': {
    color: '#f00',
  },
});

const StyledButton = styled(Button)({
  backgroundColor: '#f00',
  color: '#111',
  '&:hover': {
    backgroundColor: '#d00',
  },
});

const QrCodeGenerator = () => {
    const { userData } = useUserData();
    const [url, setUrl] = useState('');
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      const reader = new FileReader();
      reader.onloadend = async function() {
        const logoContent = reader.result.split(',')[1];
        const logoType = logo.type.split('/')[1].toUpperCase();
        
        const payload = {
          url: url,
          logo: {
            type: logoType,
            content: logoContent
          },
          role: userData.role,
          googleToken: userData.googleToken,
          username: userData.username
        };
  
        try {
          const scriptId = 'qr_script';
          const action = 'generateQrCode';
          
          const response = await apiCall(scriptId, action, payload);
          
          setLoading(false);
          if (response.error) {
            setResult({ error: response.error });
          } else {
            setResult(response);
          }
        } catch (err) {
          console.error('Error in generateQrCode:', err);
          setLoading(false);
          setResult({ error: `Failed to generate QR code: ${err.message}` });
        }
      };
      reader.readAsDataURL(logo);
    };

  return (
    <Box sx={{ 
      backgroundColor: '#111', 
      minHeight: '100vh',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center'
    }}>
      <StyledPaper>
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px',
          }}>
            <CircularProgress sx={{ color: '#f00' }} />
          </Box>
        )}
        <Typography variant="h5" component="h1" sx={{ color: '#f00', marginBottom: 2 }}>
          QR Code Generator
        </Typography>
        <StyledForm onSubmit={handleSubmit}>
          <StyledInput
            label="Enter URL"
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <StyledInput
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
            required
          />
          <StyledButton type="submit" variant="contained">
            Generate QR Code
          </StyledButton>
        </StyledForm>
        
        {result && (
          <Box sx={{ marginTop: 2 }}>
            {result.error ? (
              <Typography color="error">Error: {result.error}</Typography>
            ) : (
              <>
                <Typography sx={{ color: '#f00' }}>QR Code Generated:</Typography>
                <Box sx={{ 
                  border: '1px solid #f00', 
                  borderRadius: '5px', 
                  padding: 1, 
                  marginTop: 1,
                  wordBreak: 'break-all'
                }}>
                  <Typography sx={{ color: '#f00' }}>
                    Copy and paste this link into your browser to download the QR code:
                  </Typography>
                  <Typography sx={{ color: '#f00' }}>
                    {result.imageUrl}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        )}
      </StyledPaper>
    </Box>
  );
};

export default QrCodeGenerator;