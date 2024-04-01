import {
  AllowList,
  CandyGuard,
  CandyMachine,
  getMerkleProof,
  mintV2,
  route,
} from '@metaplex-foundation/mpl-candy-machine';
import {
  AddressLookupTableInput,
  KeypairSigner,
  Option,
  PublicKey,
  Some,
  Transaction,
  Umi,
  createBigInt,
  generateSigner,
  none,
  publicKey,
  signAllTransactions,
  sol,
  some,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  DigitalAsset,
  DigitalAssetWithToken,
  JsonMetadata,
  fetchDigitalAsset,
  fetchJsonMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  Box,
  Button,
  Grid,
  Typography,
  Tooltip,
  Divider,
  TextField,
} from '@mui/material';
import { fetchAddressLookupTable } from '@metaplex-foundation/mpl-toolbox';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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

function toast(a: any) {
  console.log('toast', a);
}

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

const fetchNft = async (umi: Umi, nftAdress: PublicKey) => {
  let digitalAsset: DigitalAsset | undefined;
  let jsonMetadata: JsonMetadata | undefined;
  try {
    digitalAsset = await fetchDigitalAsset(umi, nftAdress);
    jsonMetadata = await fetchJsonMetadata(umi, digitalAsset.metadata.uri);
  } catch (e) {
    console.error(e);
    toast({
      title: 'Nft could not be fetched!',
      description: 'Please check your Wallet instead.',
      status: 'info',
      duration: 900,
      isClosable: true,
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
      toast({
        title: 'Allowlist detected. Please sign to be approved to mint.',
        status: 'info',
        duration: 900,
        isClosable: true,
      });
      await routeBuild.sendAndConfirm(umi, {
        confirm: { commitment: 'processed' },
        send: {
          skipPreflight: true,
        },
      });
    }

    // fetch LUT
    let tables: AddressLookupTableInput[] = [];
    const lut = process.env.NEXT_PUBLIC_LUT;
    if (lut) {
      const lutPubKey = publicKey(lut);
      const fetchedLut = await fetchAddressLookupTable(umi, lutPubKey);
      tables = [fetchedLut];
    } else {
      toast({
        title: 'The developer should really set a lookup table!',
        status: 'warning',
        duration: 900,
        isClosable: true,
      });
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

    toast({
      title: `${signedTransactions.length} Transaction(s) sent!`,
      status: 'success',
      duration: 3000,
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
    toast({
      title: 'Your mint failed!',
      description: 'Please try again.',
      status: 'error',
      duration: 900,
      isClosable: true,
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
// new component called timer that calculates the remaining Time based on the bigint solana time and the bigint toTime difference.
const Timer = ({
  solanaTime,
  toTime,
  setCheckEligibility,
}: {
  solanaTime: bigint;
  toTime: bigint;
  setCheckEligibility: Dispatch<SetStateAction<boolean>>;
}) => {
  const [remainingTime, setRemainingTime] = useState<bigint>(
    toTime - solanaTime
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        return prev - BigInt(1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  //convert the remaining time in seconds to the amount of days, hours, minutes and seconds left
  const days = remainingTime / BigInt(86400);
  const hours = (remainingTime % BigInt(86400)) / BigInt(3600);
  const minutes = (remainingTime % BigInt(3600)) / BigInt(60);
  const seconds = remainingTime % BigInt(60);
  if (days > BigInt(0)) {
    return (
      <Typography fontSize="sm" fontWeight="bold">
        {days.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}
        d{' '}
        {hours.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}
        h{' '}
        {minutes.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}
        m{' '}
        {seconds.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}
        s
      </Typography>
    );
  }
  if (hours > BigInt(0)) {
    return (
      <Typography fontSize="sm" fontWeight="bold">
        {hours.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}
        h{' '}
        {minutes.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}
        m{' '}
        {seconds.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}
        s
      </Typography>
    );
  }
  if (minutes > BigInt(0) || seconds > BigInt(0)) {
    return (
      <Typography fontSize="sm" fontWeight="bold">
        {minutes.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}
        m{' '}
        {seconds.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}
        s
      </Typography>
    );
  }
  if (remainingTime === BigInt(0)) {
    setCheckEligibility(true);
  }
  return <Typography></Typography>;
};

type Props = {
  umi: Umi;
  guardList: GuardReturn[];
  candyMachine: CandyMachine | undefined;
  candyGuard: CandyGuard | undefined;
  ownedTokens: DigitalAssetWithToken[] | undefined;
  setGuardList: Dispatch<SetStateAction<GuardReturn[]>>;
  mintsCreated:
    | {
        mint: PublicKey;
        offChainMetadata: JsonMetadata | undefined;
      }[]
    | undefined;
  setMintsCreated: Dispatch<
    SetStateAction<
      | { mint: PublicKey; offChainMetadata: JsonMetadata | undefined }[]
      | undefined
    >
  >;
  onOpen: () => void;
  setCheckEligibility: Dispatch<SetStateAction<boolean>>;
  allowLists: Map<string, Array<string>>;
};

export function ClaimButton({
  umi,
  guardList,
  candyMachine,
  candyGuard,
  ownedTokens = [], // provide default empty array
  setGuardList,
  mintsCreated,
  setMintsCreated,
  onOpen,
  setCheckEligibility,
  allowLists,
}: Props): JSX.Element {
  const solanaTime = useSolanaTime();
  const [numberInputValues, setNumberInputValues] = useState<{
    [label: string]: number;
  }>({});
  if (!candyMachine || !candyGuard) {
    return <></>;
  }

  const handleNumberInputChange = (label: string, value: number) => {
    setNumberInputValues((prev) => ({ ...prev, [label]: value }));
  };

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
    <Box key={index} marginTop={'20px'}>
      <div>
        {buttonGuard.endTime > createBigInt(0) &&
          buttonGuard.endTime - solanaTime > createBigInt(0) &&
          (!buttonGuard.startTime ||
            buttonGuard.startTime - solanaTime <= createBigInt(0)) && (
            <>
              <Typography fontSize="sm" marginRight={'2'}>
                Ending in:{' '}
              </Typography>
              <Timer
                toTime={buttonGuard.endTime}
                solanaTime={solanaTime}
                setCheckEligibility={setCheckEligibility}
              />
            </>
          )}
        {buttonGuard.startTime > createBigInt(0) &&
          buttonGuard.startTime - solanaTime > createBigInt(0) &&
          (!buttonGuard.endTime ||
            solanaTime - buttonGuard.endTime <= createBigInt(0)) && (
            <>
              <Typography fontSize="sm" marginRight={'2'}>
                Starting in:{' '}
              </Typography>
              <Timer
                toTime={buttonGuard.startTime}
                solanaTime={solanaTime}
                setCheckEligibility={setCheckEligibility}
              />
            </>
          )}
      </div>
      <Grid columns={2} spacing={5} container>
        <Grid item>
          {process.env.NEXT_PUBLIC_MULTIMINT && buttonGuard.allowed ? (
            <TextField
              type="number"
              value={numberInputValues[buttonGuard.label] || 1}
              inputProps={{
                min: 1,
                max: buttonGuard.maxAmount < 1 ? 1 : buttonGuard.maxAmount,
              }}
              size="small"
              disabled={!buttonGuard.allowed}
              onChange={(e) =>
                handleNumberInputChange(
                  buttonGuard.label,
                  parseInt(e.target.value)
                )
              }
            />
          ) : null}

          <Tooltip title={buttonGuard.tooltip} aria-label="Mint button">
            <Button
              onClick={() =>
                mintClick(
                  umi,
                  buttonGuard,
                  candyMachine,
                  candyGuard,
                  ownedTokens,
                  numberInputValues[buttonGuard.label] || 1,
                  mintsCreated,
                  setMintsCreated,
                  guardList,
                  setGuardList,
                  onOpen,
                  setCheckEligibility,
                  allowLists
                )
              }
              key={buttonGuard.label}
              size="small"
              disabled={!buttonGuard.allowed}
              endIcon={
                guardList.find((elem) => elem.label === buttonGuard.label)
                  ?.minting ? (
                  <div>...</div>
                ) : null
              }
            >
              {guardList.find((elem) => elem.label === buttonGuard.label)
                ?.loadingText || buttonGuard.buttonLabel}
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  ));

  return <>{listItems}</>;
}
