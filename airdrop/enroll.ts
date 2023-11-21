import { Connection, Keypair, SystemProgram, PublicKey } from '@solana/web3.js';
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
} from '@project-serum/anchor';
import { WbaPrereq, IDL } from './programs/wba_prereq';
import wallet from './wba-wallet.json';
import bs58 from 'bs58';

let decodedWallet = bs58.decode(wallet);
const keyPair = Keypair.fromSecretKey(new Uint8Array(decodedWallet));

const connection = new Connection('https://api.devnet.solana.com');

const github = Buffer.from('0xNegro', 'utf8');

const provider = new AnchorProvider(connection, new Wallet(keyPair), {
  commitment: 'confirmed',
});

const program = new Program<WbaPrereq>(
  IDL,
  'HC2oqz2p6DEWfrahenqdq2moUcga9c9biqRBcdK3XKU1' as Address,
  provider
);

const enrollment_seeds = [Buffer.from('prereq'), keyPair.publicKey.toBuffer()];

const [enrollment_key, _bump] = PublicKey.findProgramAddressSync(
  enrollment_seeds,
  program.programId
);

// Execute our enrollment transaction
(async () => {
  try {
    const txhash = await program.methods
      .complete(github)
      .accounts({
        signer: keyPair.publicKey,
        prereq: enrollment_key,
        systemProgram: SystemProgram.programId,
      })
      .signers([keyPair])
      .rpc();
    console.log(`Success! Check out your TX here:
https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
