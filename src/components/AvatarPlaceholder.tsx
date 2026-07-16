import { Avatar, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface AvatarPlaceholderProps {
  active: boolean;
}

export function AvatarPlaceholder({ active }: AvatarPlaceholderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {active && (
        <Box
          sx={{
            position: 'absolute',
            width: 168,
            height: 168,
            borderRadius: '50%',
            border: '2px solid',
            borderColor: 'secondary.main',
            opacity: 0.5,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 0.5 },
              '70%': { transform: 'scale(1.25)', opacity: 0 },
              '100%': { transform: 'scale(1.25)', opacity: 0 },
            },
          }}
        />
      )}
      <Avatar sx={{ width: 140, height: 140, bgcolor: 'primary.main' }}>
        <PersonIcon sx={{ fontSize: 84 }} />
      </Avatar>
    </Box>
  );
}
