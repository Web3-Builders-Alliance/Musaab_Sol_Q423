import { Connection, Keypair, SystemProgram, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import wallet from './wba-wallet.json';

//Testing out conversion from base58 encoded string back to byte array.

let decodedWallet = bs58.decode(wallet);
const keyPair = Keypair.fromSecretKey(new Uint8Array(decodedWallet));
console.log(`[${keyPair.secretKey}]`);
