import { ClaimButton } from './ClaimButton';
import type { CandyMachineItem } from '@munu/core-lib/solana/candymachine';
import CertificateImg from '@/lib/internal/images/certificate_02.jpg';
import { Box } from '@mui/material';

export function CandyMachine({ item }: { item: CandyMachineItem }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={(theme) => ({
          marginBottom: theme.spacing(2),
        })}
      >
        <img
          src={item.preview?.image ?? CertificateImg}
          style={{
            width: 200,
            height: 200,
          }}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ClaimButton onOpen={console.log} candyMachineItem={item} />
      </Box>
    </Box>
  );
}
