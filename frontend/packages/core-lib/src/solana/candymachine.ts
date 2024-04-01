import { publicKey, type Umi } from '@metaplex-foundation/umi';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, guestIdentity } from '@metaplex-foundation/js';
import {
  AccountVersion,
  fetchAllCandyMachine,
  safeFetchCandyGuard,
  fetchCandyMachine,
  CandyGuard,
  CandyMachine,
} from '@metaplex-foundation/mpl-candy-machine';
import { guardChecker } from '@/solana/utils/checkAllowed';
import { getSolanaTime } from '@/solana/utils/checkerHelper';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export type CandyMachineDisplay = {
  allowList: Map<string, Array<string>>;
  address: string;
};

type ItemData = {
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
    await timeout(100 + Math.random() * 50);
    const candyGuard = await safeFetchCandyGuard(umi, cm.mintAuthority);
    const availableItem = cm?.items.find(async (e) => !e.minted);
    let preview: ItemData | null = null;
    if (availableItem) {
      const resp = await fetch(availableItem?.uri);
      preview = await resp.json();
    }
    const solanaTime = await getSolanaTime(umi);
    await timeout(200 + Math.random() * 100);
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
    (process as any).env.NEXT_PUBLIC_RPC,
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

const timeout = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
