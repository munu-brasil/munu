import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  CandyGuard,
  CandyMachine,
} from '@metaplex-foundation/mpl-candy-machine';
import type { CandyMachineItem } from '@munu/core-lib/solana/candymachine';
import {
  AddressLookupTableInput,
  KeypairSigner,
  PublicKey,
  Transaction,
  Umi,
  createBigInt,
  generateSigner,
  publicKey,
  signAllTransactions,
} from '@metaplex-foundation/umi';
import {
  DigitalAsset,
  DigitalAssetWithToken,
  JsonMetadata,
  fetchDigitalAsset,
} from '@metaplex-foundation/mpl-token-metadata';
import { styled } from '@mui/material/styles';
import {
  Box,
  Grid,
  Tooltip,
  Typography,
  TooltipProps,
  tooltipClasses,
} from '@mui/material';
import { fetchAddressLookupTable } from '@metaplex-foundation/mpl-toolbox';
import {
  chooseGuardToUse,
  routeBuilder,
  mintArgsBuilder,
  GuardButtonList,
  buildTx,
  getRequiredCU,
} from '@munu/core-lib/solana/utils/mintHelper';
import { useSolanaTime } from '@munu/core-lib/solana/utils/SolanaTimeContext';
import { base58 } from '@metaplex-foundation/umi/serializers';
import { GuardReturn } from '@munu/core-lib/solana/utils/checkerHelper';
import { verifyTx } from '@munu/core-lib/solana/utils/verifyTx';
import { useWallet } from '@solana/wallet-adapter-react';
import { notify } from '@munu/core-lib/repo/notification';
import { useUmi } from '@munu/core-lib/solana/utils/useUmi';
import { Button3D } from '@/components/Button/Button3D';
import HiddenComponent from '@munu/core-lib/components/HiddenComponent';
import { createModal } from '@munu/core-lib/components/PromiseDialog';
import { WalletOnboardDialog } from '@/containers/WalletOnboardDialog';
import { guardChecker } from '@munu/core-lib/solana/utils/checkAllowed';
import Icons from '@munu/core-lib/components/Icons';
import { Timer } from './Timer';

const [rendererOnboardDialog, promiseOnboardDialog] =
  createModal(WalletOnboardDialog);

const updateLoadingText = (
  loadingText: string | undefined,
  guardList: GuardReturn[],
  label: string,
  setGuardList: Dispatch<SetStateAction<GuardReturn[]>>
) => {
  const guardIndex = guardList.findIndex((g) => g.label === label);
  if (guardIndex === -1) {
    console.error('guard not found');
    return;
  }
  const newGuardList = [...guardList];
  newGuardList[guardIndex].loadingText = loadingText;
  setGuardList(newGuardList);
};

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 300,
    fontSize: theme.typography.pxToRem(12),
  },
}));

const fetchNft = async (umi: Umi, nftAdress: PublicKey) => {
  let digitalAsset: DigitalAsset | undefined;
  let jsonMetadata: JsonMetadata | undefined;
  try {
    digitalAsset = await fetchDigitalAsset(umi, nftAdress);
    jsonMetadata = await fetch(digitalAsset.metadata.uri).then((r) => r.json());
  } catch (e) {
    console.error(e);
    notify({
      message: 'Nft could not be fetched!',
      type: 'error',
      temporary: true,
    });
  }

  return { digitalAsset, jsonMetadata };
};

const mintClick = async (
  umi: Umi,
  guard: GuardReturn,
  candyMachine: CandyMachine,
  candyGuard: CandyGuard,
  ownedTokens: DigitalAssetWithToken[],
  mintAmount: number,
  mintsCreated:
    | {
        mint: PublicKey;
        offChainMetadata: JsonMetadata | undefined;
      }[]
    | undefined,
  setMintsCreated: Dispatch<
    SetStateAction<
      | { mint: PublicKey; offChainMetadata: JsonMetadata | undefined }[]
      | undefined
    >
  >,
  guardList: GuardReturn[],
  setGuardList: Dispatch<SetStateAction<GuardReturn[]>>,
  onOpen: () => void,
  setCheckEligibility: Dispatch<SetStateAction<boolean>>,
  allowLists: Map<string, Array<string>>
) => {
  const guardToUse = chooseGuardToUse(guard, candyGuard);
  if (!guardToUse.guards) {
    console.error('no guard defined!');
    return;
  }

  try {
    //find the guard by guardToUse.label and set minting to true
    const guardIndex = guardList.findIndex((g) => g.label === guardToUse.label);
    if (guardIndex === -1) {
      console.error('guard not found');
      return;
    }
    const newGuardList = [...guardList];
    newGuardList[guardIndex].minting = true;
    setGuardList(newGuardList);

    let routeBuild = await routeBuilder(
      umi,
      guardToUse,
      candyMachine,
      allowLists
    );
    if (routeBuild) {
      notify({
        message: 'Allowlist detected. Please sign to be approved to mint.',
        type: 'info',
        temporary: true,
      });
      const result = await routeBuild.sendAndConfirm(umi, {
        confirm: { commitment: 'processed' },
        send: {
          skipPreflight: true,
        },
      });
      console.log('allowlist result', result);
    }

    // fetch LUT
    let tables: AddressLookupTableInput[] = [];
    const lut = process.env.NEXT_PUBLIC_LUT;
    if (lut) {
      const lutPubKey = publicKey(lut);
      const fetchedLut = await fetchAddressLookupTable(umi, lutPubKey);
      tables = [fetchedLut];
    }

    const mintTxs: Transaction[] = [];
    let nftsigners = [] as KeypairSigner[];

    const latestBlockhash = (await umi.rpc.getLatestBlockhash()).blockhash;

    const mintArgs = mintArgsBuilder(
      candyMachine,
      guardToUse,
      ownedTokens,
      allowLists
    );
    const nftMint = generateSigner(umi);
    const txForSimulation = buildTx(
      umi,
      candyMachine,
      candyGuard,
      nftMint,
      guardToUse,
      mintArgs,
      tables,
      latestBlockhash,
      1_400_000
    );
    const requiredCu = await getRequiredCU(umi, txForSimulation);

    for (let i = 0; i < mintAmount; i++) {
      const nftMint = generateSigner(umi);
      nftsigners.push(nftMint);
      const transaction = buildTx(
        umi,
        candyMachine,
        candyGuard,
        nftMint,
        guardToUse,
        mintArgs,
        tables,
        latestBlockhash,
        requiredCu
      );
      console.log(transaction);
      mintTxs.push(transaction);
    }
    if (!mintTxs.length) {
      console.error('no mint tx built!');
      return;
    }

    updateLoadingText(`Please sign`, guardList, guardToUse.label, setGuardList);
    const signedTransactions = await signAllTransactions(
      mintTxs.map((transaction, index) => ({
        transaction,
        signers: [umi.payer, nftsigners[index]],
      }))
    );

    let signatures: Uint8Array[] = [];
    let amountSent = 0;
    const sendPromises = signedTransactions.map((tx, index) => {
      return umi.rpc
        .sendTransaction(tx)
        .then((signature) => {
          console.log(
            `Transaction ${index + 1} resolved with signature: ${
              base58.deserialize(signature)[0]
            }`
          );
          amountSent = amountSent + 1;
          signatures.push(signature);
          return { status: 'fulfilled', value: signature };
        })
        .catch((error) => {
          console.error(`Transaction ${index + 1} failed:`, error);
          return { status: 'rejected', reason: error };
        });
    });

    await Promise.allSettled(sendPromises);

    if (!(await sendPromises[0]).status === true) {
      // throw error that no tx was created
      throw new Error('no tx was created');
    }
    updateLoadingText(
      `finalizing transaction(s)`,
      guardList,
      guardToUse.label,
      setGuardList
    );

    notify({
      message: `${signedTransactions.length} Transaction(s) sent!`,
      type: 'info',
      temporary: true,
    });

    const successfulMints = await verifyTx(umi, signatures);

    updateLoadingText(
      'Fetching your NFT',
      guardList,
      guardToUse.label,
      setGuardList
    );

    // Filter out successful mints and map to fetch promises
    const fetchNftPromises = successfulMints.map((mintResult) =>
      fetchNft(umi, mintResult).then((nftData) => ({
        mint: mintResult,
        nftData,
      }))
    );

    const fetchedNftsResults = await Promise.all(fetchNftPromises);

    // Prepare data for setting mintsCreated
    let newMintsCreated: { mint: PublicKey; offChainMetadata: JsonMetadata }[] =
      [];
    fetchedNftsResults.map((acc) => {
      if (acc.nftData.digitalAsset && acc.nftData.jsonMetadata) {
        newMintsCreated.push({
          mint: acc.mint,
          offChainMetadata: acc.nftData.jsonMetadata,
        });
      }
      return acc;
    }, []);

    // Update mintsCreated only if there are new mints
    if (newMintsCreated.length > 0) {
      setMintsCreated(newMintsCreated);
      onOpen();
    }
  } catch (e) {
    console.error(`minting failed because of ${e}`);
    notify({
      message: 'Your mint failed!',
      type: 'error',
      temporary: true,
    });
  } finally {
    //find the guard by guardToUse.label and set minting to true
    const guardIndex = guardList.findIndex((g) => g.label === guardToUse.label);
    if (guardIndex === -1) {
      console.error('guard not found');
      return;
    }
    const newGuardList = [...guardList];
    newGuardList[guardIndex].minting = false;
    setGuardList(newGuardList);
    setCheckEligibility(true);
    updateLoadingText(undefined, guardList, guardToUse.label, setGuardList);
  }
};

const useConnectWallet = ({
  callback,
  checkEligibility,
}: {
  callback: () => void;
  checkEligibility: () => Promise<{
    allowed: boolean;
    ownedTokens: DigitalAssetWithToken[] | undefined;
    guards: GuardReturn[];
  }>;
}) => {
  const [loading, setLoading] = useState(false);
  const [, setIsConnected] = useState(false);
  const { connect, wallet, connected } = useWallet();

  const onConnect = useCallback(async () => {
    setLoading(true);
    if (!wallet) {
      const ok = await promiseOnboardDialog();
      if (!ok) {
        setLoading(false);
        setIsConnected(false);
        return;
      }
    } else {
      try {
        await connect();
      } catch (e) {
        setLoading(false);
        setIsConnected(false);
        return;
      }
    }
    setIsConnected(true);
  }, [wallet]);

  useEffect(() => {
    const t = setTimeout(() => {
      checkEligibility().then(({ allowed }) => {
        setIsConnected((isConnected) => {
          if (isConnected && allowed) {
            callback();
            setLoading(false);
            return false;
          }
          return isConnected;
        });
      });
    }, 500);
    return () => {
      clearTimeout(t);
    };
  }, [checkEligibility]);

  return [loading, connected, onConnect] as [
    typeof loading,
    typeof connected,
    typeof onConnect
  ];
};

type Props = {
  candyMachineItem: CandyMachineItem;
  onOpen: () => void;
};

export function ClaimButton({ onOpen, candyMachineItem }: Props): JSX.Element {
  const { candyMachine, candyGuard, allowList } = candyMachineItem;
  const [isAllowed, setIsAllowed] = useState(false);
  const [ownedTokens, setOwnedTokens] = useState<DigitalAssetWithToken[]>([]);
  const [guardList, setGuardList] = useState<GuardReturn[]>([
    { label: 'startDefault', allowed: false, maxAmount: 0 },
  ]);
  const [checkEligibility, setCheckEligibility] = useState<boolean>(true);
  const [mintsCreated, setMintsCreated] = useState<
    | { mint: PublicKey; offChainMetadata: JsonMetadata | undefined }[]
    | undefined
  >();
  const solanaTime = useSolanaTime();
  const umi = useUmi();

  const checkEligibilityFunc = useCallback(() => {
    return new Promise<{
      allowed: boolean;
      ownedTokens: DigitalAssetWithToken[] | undefined;
      guards: GuardReturn[];
    }>(async (resolve) => {
      if (
        !candyMachineItem.candyMachine ||
        !candyMachineItem.candyGuard ||
        !checkEligibility
      ) {
        return;
      }
      const { guardReturn, ownedTokens } = await guardChecker(
        umi,
        candyMachineItem.candyGuard,
        candyMachineItem.candyMachine,
        solanaTime,
        candyMachineItem.allowList
      );

      setOwnedTokens(ownedTokens ?? []);
      setGuardList(guardReturn);
      setIsAllowed(false);

      let allowed = false;
      for (const guard of guardReturn) {
        if (guard.allowed) {
          allowed = true;
          break;
        }
      }

      setIsAllowed(allowed);
      resolve({ allowed, ownedTokens, guards: guardReturn });
    });
    // On purpose: not check for candyMachine, candyGuard, solanaTime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [umi, checkEligibility, candyMachineItem]);

  if (!candyMachine || !candyGuard) {
    return <></>;
  }

  // remove duplicates from guardList
  //fucked up bugfix
  let filteredGuardlist = guardList.filter(
    (elem, index, self) =>
      index === self.findIndex((t) => t.label === elem.label)
  );
  if (filteredGuardlist.length === 0) {
    return <></>;
  }
  // Guard "default" can only be used to mint in case no other guard exists
  if (filteredGuardlist.length > 1) {
    filteredGuardlist = guardList.filter((elem) => elem.label != 'default');
  }
  let buttonGuardList = [];
  for (const guard of filteredGuardlist) {
    const text = 'Claim';
    // find guard by label in candyGuard
    const group = candyGuard.groups.find((elem) => elem.label === guard.label);
    let startTime = createBigInt(0);
    let endTime = createBigInt(0);
    if (group) {
      if (group.guards.startDate.__option === 'Some') {
        startTime = group.guards.startDate.value.date;
      }
      if (group.guards.endDate.__option === 'Some') {
        endTime = group.guards.endDate.value.date;
      }
    }

    let buttonElement: GuardButtonList = {
      label: guard ? guard.label : 'default',
      allowed: guard.allowed,
      buttonLabel: text,
      startTime,
      endTime,
      tooltip: guard.reason,
      maxAmount: guard.maxAmount,
    };
    buttonGuardList.push(buttonElement);
  }

  const listItems = buttonGuardList.map((buttonGuard, index) => (
    <ButtonGuard
      key={index}
      isAllowed={isAllowed}
      guardList={guardList}
      solanaTime={solanaTime}
      success={(mintsCreated ?? [])?.length > 0}
      buttonGuard={buttonGuard}
      checkEligibility={checkEligibilityFunc}
      setCheckEligibility={setCheckEligibility}
      onClick={() => {
        mintClick(
          umi,
          buttonGuard,
          candyMachine,
          candyGuard,
          ownedTokens,
          buttonGuard?.mintAmount || 1,
          mintsCreated,
          setMintsCreated,
          guardList,
          setGuardList,
          onOpen,
          setCheckEligibility,
          allowList
        );
      }}
    />
  ));

  return (
    <>
      {listItems}
      {rendererOnboardDialog}
    </>
  );
}

type ButtonGuardProps = {
  success?: boolean;
  solanaTime: bigint;
  isAllowed: boolean;
  guardList: GuardReturn[];
  buttonGuard: GuardButtonList;
  onClick: () => void;
  setCheckEligibility: Dispatch<SetStateAction<boolean>>;
  checkEligibility: () => Promise<{
    allowed: boolean;
    ownedTokens: DigitalAssetWithToken[] | undefined;
    guards: GuardReturn[];
  }>;
};

const ButtonGuard = (props: ButtonGuardProps) => {
  const {
    success,
    guardList,
    isAllowed,
    buttonGuard,
    solanaTime,
    onClick,
    setCheckEligibility,
    checkEligibility,
  } = props;
  const [connecting, connected, onConnect] = useConnectWallet({
    callback: onClick,
    checkEligibility,
  });

  const showEndTime =
    buttonGuard.endTime > createBigInt(0) &&
    buttonGuard.endTime - solanaTime > createBigInt(0) &&
    (!buttonGuard.startTime ||
      buttonGuard.startTime - solanaTime <= createBigInt(0));
  const showStartTime =
    buttonGuard.startTime > createBigInt(0) &&
    buttonGuard.startTime - solanaTime > createBigInt(0) &&
    (!buttonGuard.endTime ||
      solanaTime - buttonGuard.endTime <= createBigInt(0));

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!connected) {
        onConnect();
        return;
      }
      onClick();
    },
    [connected, onConnect, onClick]
  );

  return (
    <Box marginTop="20px">
      <Grid columns={2} spacing={5} container>
        <Grid item>
          <HtmlTooltip
            arrow
            open={showStartTime || showEndTime}
            placement="top"
            title={
              <div>
                <HiddenComponent hidden={!showEndTime}>
                  <Typography
                    fontSize="sm"
                    marginRight="2"
                    sx={(theme) => ({
                      display: 'flex',
                      color: theme.palette.common.white,
                    })}
                  >
                    <span>Ending in:</span>
                    <Timer
                      toTime={buttonGuard.endTime}
                      solanaTime={solanaTime}
                      setCheckEligibility={setCheckEligibility}
                    />
                  </Typography>
                </HiddenComponent>
                <HiddenComponent hidden={!showStartTime}>
                  <Typography
                    fontSize="sm"
                    marginRight="2"
                    sx={(theme) => ({
                      display: 'flex',
                      color: theme.palette.common.white,
                    })}
                  >
                    <span>Starting in:&nbsp;</span>
                    <Timer
                      toTime={buttonGuard.startTime}
                      solanaTime={solanaTime}
                      setCheckEligibility={setCheckEligibility}
                    />
                  </Typography>
                </HiddenComponent>
              </div>
            }
          >
            <div>
              <Tooltip title={buttonGuard.tooltip} aria-label="Mint button">
                <Button3D
                  size="small"
                  onClick={handleClick}
                  style={{ minWidth: 150 }}
                  key={buttonGuard.label}
                  disabled={connecting || success || (connected && !isAllowed)}
                  endIcon={
                    guardList.find((elem) => elem.label === buttonGuard.label)
                      ?.minting ? (
                      <div>...</div>
                    ) : null
                  }
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...(success
                      ? {
                          '&: disabled': {
                            color: theme.palette.common.white,
                            background: `${theme.palette.success.main} !important`,
                            border: `solid 1px ${theme.palette.success.light} !important`,
                            boxShadow: `0px 10px 0px ${theme.palette.success.dark} !important`,
                            MozBoxShadow: `0px 10px 0px ${theme.palette.success.dark} !important`,
                            WebkitBoxShadow: `0px 10px 0px ${theme.palette.success.dark} !important`,
                          },
                        }
                      : {}),
                  })}
                >
                  {success ? (
                    <Icons.CheckCircle8Bit style={{ width: 25, height: 25 }} />
                  ) : (
                    guardList.find((elem) => elem.label === buttonGuard.label)
                      ?.loadingText || buttonGuard.buttonLabel
                  )}
                </Button3D>
              </Tooltip>
            </div>
          </HtmlTooltip>
        </Grid>
      </Grid>
    </Box>
  );
};
