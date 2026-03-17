import {
  Address,
  createSolanaRpc,
  isSolanaError,
  SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
} from "@solana/kit";
import { getHxuiTokenAddress } from "./pdas";
import { fetchToken } from "@solana-program/token";

export async function isHxuiTokenAccountFound({
  rpc,
  owner,
}: {
  rpc: ReturnType<typeof createSolanaRpc>;
  owner: Address;
}) {
  const hxuiTokenAddress = await getHxuiTokenAddress({
    owner,
  });

  try {
    await fetchToken(rpc, hxuiTokenAddress);
    return true;
  } catch (err) {
    if (isSolanaError(err, SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND))
      return false;
  }
  throw new Error("Uncaught error in helpers.");
}
