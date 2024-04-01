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
import { Box, CircularProgress } from '@mui/material';
import { BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function CandyMachine({ item }: { item: CandyMachineItem }) {
  const umi = useUmi();
  const solanaTime = useSolanaTime();
  const [mintsCreated, setMintsCreated] = useState<
    | { mint: PublicKey; offChainMetadata: JsonMetadata | undefined }[]
    | undefined
  >();
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [success, setSuccess] = useState(false);
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

  const onclick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  }, []);


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
        <Button3D
          component="div"
          style={{ minWidth: 150 }}
          disabled={!isAllowed || success || loading}
          //onClick={onclick}
          sx={
            success
              ? (theme) => ({
                  '&: disabled': {
                    color: theme.palette.common.white,
                    background: `${theme.palette.success.main} !important`,
                    border: `solid 1px ${theme.palette.success.light} !important`,
                    boxShadow: `0px 10px 0px ${theme.palette.success.dark} !important`,
                    MozBoxShadow: `0px 10px 0px ${theme.palette.success.dark} !important`,
                    WebkitBoxShadow: `0px 10px 0px ${theme.palette.success.dark} !important`,
                  },
                })
              : {}
          }
        >
          {!success && !loading ? (
            !isAllowed ? (
              <BaseWalletMultiButton
                labels={{
                  'change-wallet': 'Mudar carteira',
                  'copy-address': 'Copiar endereço',
                  'has-wallet': 'Carteira encontrada',
                  'no-wallet': 'Nenhuma carteira',
                  connecting: 'Conectando',
                  copied: 'Copiado',
                  disconnect: 'Desconectar',
                }}
              />
            ) : (
              <ClaimButton
                guardList={guards}
                candyMachine={item.candyMachine}
                candyGuard={item.candyGuard!}
                umi={umi}
                ownedTokens={ownedTokens}
                setGuardList={setGuards}
                mintsCreated={mintsCreated}
                setMintsCreated={setMintsCreated}
                onOpen={console.log}
                setCheckEligibility={setCheckEligibility}
                allowLists={item.allowList}
              />
            )
          ) : null}
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
      </Box>
    </Box>
  );
}
