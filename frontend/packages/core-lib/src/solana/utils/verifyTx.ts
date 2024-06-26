import { PublicKey, Umi } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';
import { notify } from '../../repo/notification';

const detectBotTax = (logs: string[]) => {
  if (logs.find((l) => l.includes('Candy Guard Botting'))) {
    return true;
  }
  return false;
};

type VerifySignatureResult =
  | { success: true; mint: PublicKey; reason?: never }
  | { success: false; mint?: never; reason: string };

export const verifyTx = async (umi: Umi, signatures: Uint8Array[]) => {
  const verifySignature = async (
    signature: Uint8Array
  ): Promise<VerifySignatureResult> => {
    console.log(base58.deserialize(signature));
    let transaction;
    for (let i = 0; i < 30; i++) {
      transaction = await umi.rpc.getTransaction(signature);
      if (transaction) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (!transaction) {
      return { success: false, reason: 'No TX found' };
    }

    if (detectBotTax(transaction.meta.logs)) {
      return { success: false, reason: 'Bot Tax detected!' };
    }

    return { success: true, mint: transaction.message.accounts[1] };
  };

  const stati = await Promise.all(signatures.map(verifySignature));
  let successful: PublicKey[] = [];
  let failed: string[] = [];
  stati.forEach((status) => {
    if (status.success === true) {
      successful.push(status.mint);
    } else {
      failed.push(status.reason);
    }
  });

  if (failed && failed.length > 0) {
    notify({
      message: `${failed.length} Mints failed!`,
      type: 'error',
      temporary: true,
    });
    failed.forEach((fail) => {
      console.error(fail);
    });
  }

  if (successful.length > 0) {
    notify({
      message: `${successful.length} Mints successful!`,
      type: 'success',
      temporary: true,
    });
  }

  return successful;
};
