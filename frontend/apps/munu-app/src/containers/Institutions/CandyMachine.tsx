import { PublicKey } from '@metaplex-foundation/umi';
import {
  DigitalAssetWithToken,
  JsonMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { useCallback, useEffect, useState } from 'react';
import { guardChecker } from '@munu/core-lib/solana/utils/checkAllowed';
import { useUmi } from '@munu/core-lib/solana/utils/useUmi';
import { GuardReturn } from '@munu/core-lib/solana/utils//checkerHelper';
import { useSolanaTime } from '@munu/core-lib/solana/utils/SolanaTimeContext';
import { ClaimButton } from './ClaimButton';
import type { CandyMachineItem } from '@munu/core-lib/solana/candymachine';

import { Button3D } from '@/components/Button/Button3D';
import CertificateImg from '@/lib/internal/images/certificate_02.jpg';
import Icons from '@munu/core-lib/components/Icons';
import HiddenComponent from '@munu/core-lib/components/HiddenComponent';
import { Box, CircularProgress } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { createModal } from '@munu/core-lib/components/PromiseDialog';
import { WalletOnboardDialog } from '@/containers/WalletOnboardDialog';

const [rendererOnboardDialog, promiseOnboardDialog] =
  createModal(WalletOnboardDialog);

export function CandyMachine({ item }: { item: CandyMachineItem }) {
  const { connect, wallet } = useWallet();

  const umi = useUmi();
  const solanaTime = useSolanaTime();
  const [mintsCreated, setMintsCreated] = useState<
    | { mint: PublicKey; offChainMetadata: JsonMetadata | undefined }[]
    | undefined
  >();
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [ownedTokens, setOwnedTokens] = useState<DigitalAssetWithToken[]>();
  const [guards, setGuards] = useState<GuardReturn[]>([
    { label: 'startDefault', allowed: false, maxAmount: 0 },
  ]);
  const [checkEligibility, setCheckEligibility] = useState<boolean>(true);

  useEffect(() => {
    const checkEligibilityFunc = async () => {
      if (!item.candyMachine || !item.candyGuard || !checkEligibility) {
        return;
      }

      setLoading(true);
      const { guardReturn, ownedTokens } = await guardChecker(
        umi,
        item.candyGuard,
        item.candyMachine,
        solanaTime,
        item.allowList
      );

      setOwnedTokens(ownedTokens);
      setGuards(guardReturn);
      setIsAllowed(false);

      let allowed = false;
      for (const guard of guardReturn) {
        if (guard.allowed) {
          allowed = true;
          break;
        }
      }

      setIsAllowed(allowed);
      setLoading(false);
    };

    checkEligibilityFunc();
    // On purpose: not check for candyMachine, candyGuard, solanaTime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [umi, checkEligibility, item]);

  const onConnect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!wallet) {
        promiseOnboardDialog();
        return;
      }
      connect();
    },
    [wallet]
  );

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
        <ClaimButton
          onOpen={console.log}
          candyMachineItem={item}
          setGuardList={setGuards}
          mintsCreated={mintsCreated}
          setMintsCreated={setMintsCreated}
        />
      </Box>
      {rendererOnboardDialog}
    </Box>
  );
}
/*

        <HiddenComponent hidden={isAllowed}>
          <Button3D
            onClick={onConnect}
            style={{ minWidth: 150 }}
            disabled={loading}
          >
            {!loading ? <b>CLAIM</b> : null}
            {success ? <Icons.CheckCircle8Bit style={{ width: 25 }} /> : null}
            {loading ? (
              <CircularProgress
                size={20}
                sx={(theme) => ({
                  color: theme.palette.common.white,
                })}
              />
            ) : null}
          </Button3D>
        </HiddenComponent>
        <HiddenComponent hidden={!isAllowed}>
        </HiddenComponent>
*/
