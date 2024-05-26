const solanaWeb3 = require('@solana/web3.js');
const bip39 = require('bip39');
const bs58 = require('bs58');
const fs = require('fs');
const readline = require('readline');

// Function to prompt the user for input
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

async function generateWallets(count) {
    let wallets = [];

    for (let i = 0; i < count; i++) {
        // Generate a mnemonic phrase
        const mnemonic = bip39.generateMnemonic();
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const keypair = solanaWeb3.Keypair.fromSeed(seed.slice(0, 32));

        // Encode the secret key in base58
        const privateKeyBase58 = bs58.encode(keypair.secretKey);

        wallets.push({
            mnemonic: mnemonic,
            publicKey: keypair.publicKey.toString(),
            secretKey: privateKeyBase58  // Now in base58 encoding
        });
    }

    return wallets;
}

async function main() {
    // Prompt user for the number of wallets
    const count = await askQuestion('How many wallets do you want to generate? ');

    // Generate the wallets
    const wallets = await generateWallets(parseInt(count, 10));

    // Prepare the wallet data for writing to file
    const walletData = wallets.map(wallet => `${wallet.publicKey}:${wallet.secretKey}:${wallet.mnemonic}`).join('\n');

    // Write the wallet data to a file
    fs.writeFileSync('wallets.txt', walletData);

    console.log('Wallets generated and saved to wallets.txt');
}

main();
