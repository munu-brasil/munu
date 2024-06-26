import { publicKey, type Umi } from '@metaplex-foundation/umi';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, guestIdentity } from '@metaplex-foundation/js';
import {
  AccountVersion,
  fetchAllCandyMachine,
  safeFetchCandyGuard,
} from '@metaplex-foundation/mpl-candy-machine';
import { guardChecker } from './utils/checkAllowed';
import { getSolanaTime } from './utils/checkerHelper';

export type CandyMachineDisplay = {
  allowList: Map<string, Array<string>>;
  address: string;
};

export type ItemData = {
  name: string;
  symbol?: string;
  description: string;
  image: string;
  properties: {
    files: {
      uri: string;
      type: string;
    }[];
    category: string;
  };
};

export async function getCandyMachines(umi: Umi, cms: CandyMachineDisplay[]) {
  const cmachines = await fetchAllCandyMachine(
    umi,
    cms.map((cm) => publicKey(cm.address))
  );
  const v2cmachines = cmachines.filter(
    (cm) => cm.version === AccountVersion.V2
  );

  const cmachinesPreview = [];
  for (let i = 0; i < v2cmachines.length; i++) {
    const cm = v2cmachines[i];
    const allowLists = cms[i].allowList;
    const candyGuard = await safeFetchCandyGuard(umi, cm.mintAuthority);
    const availableItem = cm?.items.find(async (e) => !e.minted);
    let preview: ItemData | null = null;
    if (availableItem) {
      const resp = await fetch(availableItem?.uri);
      preview = await resp.json();
    }
    const solanaTime = await getSolanaTime(umi);
    const { guardReturn, ownedTokens } = await guardChecker(
      umi,
      candyGuard!,
      cm,
      solanaTime,
      allowLists
    );
    cmachinesPreview.push({
      candyMachine: cm,
      preview,
      candyGuard,
      guardReturn,
      ownedTokens,
      allowList: cms[i].allowList,
    });
  }

  return cmachinesPreview;
}

export type CandyMachineItem = Awaited<ReturnType<typeof getCandyMachines>>[0];

export const findCandyMachineViaAuthority = async (key: string) => {
  const connection = new Connection(
    import.meta.env.VITE_PUBLIC_RPC,
    'confirmed'
  );
  const metaplex = new Metaplex(connection);
  const authority = new PublicKey(key);

  metaplex.use(guestIdentity());
  const candyMachines = await metaplex
    .candyMachines()
    .findAllCandyGuardsByAuthority({
      authority,
    });
  const candyMachinesv2 = await metaplex.candyMachinesV2().findAllBy({
    type: 'authority',
    publicKey: authority,
  });
  return [...candyMachines, ...candyMachinesv2];
};

export const findNFTByCreator = async (key: string) => {
  const connection = new Connection(
    import.meta.env.VITE_PUBLIC_RPC,
    'confirmed'
  );
  const metaplex = new Metaplex(connection);
  const authority = new PublicKey(key);

  metaplex.use(guestIdentity());

  const nfts = await metaplex.nfts().findAllByCreator({
    creator: authority,
  });
  return nfts;
};

export const findNFTByOwner = async (key: string) => {
  const connection = new Connection(
    import.meta.env.VITE_PUBLIC_RPC ?? 'https://api.devnet.solana.com',
    'confirmed'
  );
  const metaplex = new Metaplex(connection);
  const authority = new PublicKey(key);

  metaplex.use(guestIdentity());

  const nfts = await metaplex.nfts().findAllByOwner({
    owner: authority,
  });
  return nfts;
};

export const getMUNUNFTFromWallet = async (key: string) => {
  const nfts = await findNFTByOwner(key);
  const munu = nfts.filter((nft) => nft.symbol === 'MUNUCERT');
  const result: ItemData[] = [];
  for (let i = 0; i < munu.length; i++) {
    const nft = munu[i];
    const data = await fetch(nft.uri).then((res) => res.json());
    result.push(data);
  }
  return result;
};
