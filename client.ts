import {
  airdropFactory,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  sendAndConfirmTransactionFactory,
} from "@solana/kit";

export interface Client {
  rpc: ReturnType<typeof createSolanaRpc>;
  rpcSubscriptions: ReturnType<typeof createSolanaRpcSubscriptions>;
  airdrop: ReturnType<typeof airdropFactory>;
  sendAndConfirmTransaction: ReturnType<
    typeof sendAndConfirmTransactionFactory
  >;
}
let client: Client | undefined;
export function createClient(): Client {
  if (!client) {
    const rpc = createSolanaRpc("https://api.devnet.solana.com");
    const rpcSubscriptions = createSolanaRpcSubscriptions(
      "wss://api.devnet.solana.com"
    );
    const airdrop = airdropFactory({ rpc, rpcSubscriptions });
    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });
    client = { rpc, rpcSubscriptions, airdrop, sendAndConfirmTransaction };
  }
  return client;
}
