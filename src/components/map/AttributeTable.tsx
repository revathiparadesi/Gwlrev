import React from 'react';
import { Box, Button, Typography } from '@mui/joy';

interface AttributeTableProps {
  setAttributeTableOn: React.Dispatch<React.SetStateAction<boolean>>;
}

const AttributeTable: React.FC<AttributeTableProps> = ({ setAttributeTableOn }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="h5">Attribute Table</Typography>
        <Button 
          variant="outlined" 
          color="neutral" 
          onClick={() => setAttributeTableOn(false)}
        >
          Close
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Table content would go here */}
        <Typography>
          Attribute table content will be displayed here.
        </Typography>
      </Box>
    </Box>
  );
};

export default AttributeTable;