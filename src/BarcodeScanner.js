import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Box,
  Typography
} from '@mui/material';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import Webcam from 'react-webcam';

const BarcodeScanner = ({ open, onClose, onScan }) => {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    if (open && webcamRef.current) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [open]);

  const startScanning = async () => {
    try {
      setScanning(true);
      setError(null);
      
      const videoElement = webcamRef.current?.video;
      if (!videoElement) return;

      await codeReader.current.decodeFromVideoDevice(
        undefined, // use default camera
        videoElement,
        (result, error) => {
          if (result) {
            onScan(result.getText());
            stopScanning();
            onClose();
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error(error);
          }
        }
      );
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      console.error(err);
    }
  };

  const stopScanning = () => {
    codeReader.current.reset();
    setScanning(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan Barcode</DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
          {error ? (
            <Typography color="error" sx={{ p: 2 }}>
              {error}
            </Typography>
          ) : (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                width="100%"
                height="100%"
                videoConstraints={{
                  facingMode: 'environment' // Use back camera on mobile
                }}
              />
              {scanning && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid #00ff00',
                    width: '60%',
                    height: '30%',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner;