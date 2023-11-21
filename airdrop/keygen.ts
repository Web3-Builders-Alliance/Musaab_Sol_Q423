import { Keypair } from '@solana/web3.js';

let keyPair = Keypair.generate();
console.log(
  `You've generated a new Solana Wallet: ${keyPair.publicKey.toBase58()}`
);

console.log(`[${keyPair.secretKey}]`);
