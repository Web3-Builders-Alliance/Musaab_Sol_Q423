import { Commitment, Connection, Keypair, PublicKey } from '@solana/web3.js';
import wallet from './wba-wallet.json';
import { createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from '@metaplex-foundation/umi';

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const umi = createUmi(RPC_ENDPOINT);
const myKeypair = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);
const signer = createSignerFromKeypair(umi, myKeypair);
umi.use(signerIdentity(signer));

//Create a Solana devnet connection
const commitment: Commitment = 'confirmed';
const connection = new Connection('https://api.devnet.solana.com', commitment);

// Define our Mint address
const mint = new PublicKey('9sGvxXZKCUm7tNwsrENYow4oGLhDn4AqKdHrTVrvTLa2');

// Add the Token Metadata Program
const token_metadata_program_id = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

// Create PDA for token metadata
const metadata_seeds = [
  Buffer.from('metadata'),
  token_metadata_program_id.toBuffer(),
  mint.toBuffer(),
];
const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(
  metadata_seeds,
  token_metadata_program_id
);

(async () => {
  try {
    let transaction = createMetadataAccountV3(umi, {
      metadata: publicKey(metadata_pda.toString()),
      mint: publicKey(mint.toString()),
      mintAuthority: signer,
      payer: signer,
      updateAuthority: publicKey(keypair.publicKey.toString()),
      data: {
        name: 'Moo WBA Token 2',
        symbol: 'MooWBA2',
        uri: '',
        sellerFeeBasisPoints: 0,
        creators: null,
        uses: null,
        collection: null,
      },
      isMutable: true,
      collectionDetails: null,
    });

    const txHash = await transaction.sendAndConfirm(umi);
    console.log(transaction);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
