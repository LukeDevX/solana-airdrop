import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TestStructureArray } from "./target/types/test_structure_array";

import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js"


import "dotenv/config"; // 加载dev配置文件
import base58 from 'bs58';


(async () => {
    // const devConnection = new Connection('https://devnet.helius-rpc.com/?api-key=ad4acf69-6c69-4edf-bccc-28397c4956e9')
    const devConnection = new Connection('http://localhost:8899')
    anchor.setProvider(anchor.AnchorProvider.env());


    // 第一个钱包部署者钱包
    // 公钥 ：A2W9314MCgkYBJzCoS3aPsgFeMayeQC8naELBQU6W9JL
    const userKeypair1 = Keypair.fromSecretKey(base58.decode(process.env.SECRET_KEY1 || ""))
    const add1 = userKeypair1.publicKey.toBase58()
    const userAdd1 = new PublicKey(add1); // 地址
    // let myBalance1 = await devConnection.getBalance(userAdd1);



    let myBalance1 = await devConnection.getBalance(userAdd1);

    // 第二个参与者钱包
    // 公钥 ：8uyUtH1R5kQfNoV45sovhVwdtkmkrxkuQQRKPTtG9Snv
    const userKeypair2 = Keypair.fromSecretKey(base58.decode(process.env.SECRET_KEY2 || ""))
    const add2 = userKeypair2.publicKey.toBase58() // 地址
    const userAdd2 = new PublicKey(add2)

    let myBalance2 = await devConnection.getBalance(userAdd2)
    // let myBalance2 = await devConnection.getBalance(userAdd2) // 获取账户余额

    let balanceInSol1 = myBalance1 / LAMPORTS_PER_SOL
    let balanceInSol2 = myBalance2 / LAMPORTS_PER_SOL

    console.log(`部署者 ${userAdd1} -- 余额 ${balanceInSol1} SOL`)
    console.log(`参与者 ${userAdd2} -- 余额 ${balanceInSol2} SOL`)



    const program = anchor.workspace.TestStructureArray as Program<TestStructureArray>;

    let confirmOptions = {
        skipPreflight: false,
    };

    const mintAuthority = userKeypair1;


    const lib_PROGRAM_ID = new PublicKey("FZhV3Aw5FFit8ro3QtDJaNJDoPYDeWybqnV7GkSLLqFn");
    let [userInfoVec, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_info_vec")], // seeds 为
        lib_PROGRAM_ID
    );

    console.log("userInfoVec:", userInfoVec);
    console.log("bump:", bump);

    let initAccounts = {
        userinfo: userInfoVec,
        signer: mintAuthority.publicKey,
    }

    let txHash = await program.methods
        .initialize()
        // .accounts(initAccounts)
        // .signers([mintAuthority])// 签名交易
        .rpc(confirmOptions);
    console.log(`Initialize`);
    console.log(txHash);


    // let txHashIdo = await program.methods
    //     .userIdo(new anchor.BN(10))
    //     .accounts(initAccounts)
    //     .signers([mintAuthority])// 签名交易
    //     .rpc(confirmOptions);
    // console.log(`txHashIdo`);
    // console.log(txHashIdo);
    // await logTransaction(txHashIdo);



    // await logTransaction(txHash);



    // let idoAccounts = {
    //     signer: mintAuthority.publicKey,
    // }


    async function logTransaction(txHash) {
        const { blockhash, lastValidBlockHeight } =
            await devConnection.getLatestBlockhash();

        await devConnection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature: txHash,
        });

        console.log(
            `Solana txHash: ${txHash}`);
        //     console.log(
        //         `Solana Explorer: https://explorer.solana.com/tx/${txHash}?cluster=devnet`
        //     );
    }

})();