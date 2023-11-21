import {
  Transaction,
  SystemProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';
import wallet from './dev-wallet.json';

const fromDevWallet = Keypair.fromSecretKey(new Uint8Array(wallet));
const toWBAWallet = new PublicKey(
  '2irxbdLTMDGGy3Xw4QmoUpAdCR9KgmNZhaKS366cWejz'
);
const connection = new Connection('https://api.devnet.solana.com');

(async () => {
  try {
    // Get balance of dev wallet
    const balance = await connection.getBalance(fromDevWallet.publicKey);
    // Create a test transaction to calculate fees
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromDevWallet.publicKey,
        toPubkey: toWBAWallet,
        lamports: balance,
      })
    );
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash('confirmed')
    ).blockhash;

    transaction.feePayer = fromDevWallet.publicKey;
    // Calculate exact fee rate to transfer entire SOL amount out of account minus fees

    const fee =
      (
        await connection.getFeeForMessage(
          transaction.compileMessage(),
          'confirmed'
        )
      ).value || 0;

    // Remove our transfer instruction to replace it
    transaction.instructions.pop();
    // Now add the instruction back with correct amount of lamports

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromDevWallet.publicKey,
        toPubkey: toWBAWallet,
        lamports: balance - fee,
      })
    );
    // Sign transaction, broadcast, and confirm
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      fromDevWallet,
    ]);
    console.log(`Success! Check out your TX here:
https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
