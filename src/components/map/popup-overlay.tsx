import React from 'react';
import { Box, Typography } from '@mui/joy';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { PopupContent } from '../../types/map-types';

interface OverlayContentProps {
  content: PopupContent;
  onClose: () => void;
  onExpand: (src: string) => void;
}

const OverlayContent: React.FC<OverlayContentProps> = ({ content, onClose, onExpand }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        border: '1px solid black',
        padding: 1,
        borderRadius: '8px',
        position: 'relative',
      }}
    >
      <CloseIcon
        fontSize="small"
        sx={{ position: 'absolute', right: 0, cursor: 'pointer' }}
        htmlColor="#0d3965"
        onClick={onClose}
      />
      {content.src && (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <img
            key={content.key}
            src={content.src}
            alt="Point image"
            style={{
              width: '100px',
              height: '100px',
              marginBottom: '10px',
            }}
          />
          <IconButton
            onClick={() => onExpand(content.src)}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '4px',
            }}
          >
            <ZoomOutMapIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Typography>{content.image_name}</Typography>
      <Typography>
        <strong>Lat:</strong> {content.lat}
      </Typography>
      <Typography>
        <strong>Long:</strong> {content.long}
      </Typography>
    </Box>
  );
};

export default OverlayContent;