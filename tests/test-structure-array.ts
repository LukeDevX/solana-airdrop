import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TestStructureArray } from "../target/types/test_structure_array";

import { describe, it } from 'mocha';
import "dotenv/config"; // 加载dev配置文件


import { Keypair, Connection, PublicKey } from "@solana/web3.js"
import {
  getAccount,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

import { keypairIdentity, token, Metaplex } from "@metaplex-foundation/js";

import {
  PROGRAM_ID as METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
  TokenStandard
} from "@metaplex-foundation/mpl-token-metadata"; // 用于处理元数据的程序


/// 发布合约到测试网 ：anchor test --skip-local-validator


// 发币合约中如何保证，我添加的就是我的信息，我发的就是我的信息
// 外部签名后
// 在合约中构建指令，发送消息
// pub user: AccountInfo<'info>,


describe("test-structure-array", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());


  // 部署者密钥1
  let secretKey = Uint8Array.from([30, 240, 35, 42, 27, 238, 200, 249, 187, 255, 152, 130, 199, 65, 213, 144, 146, 160, 154, 79, 58, 104, 177, 56, 233, 17, 243, 160, 122, 151, 197, 253, 134, 27, 181, 206, 132, 195, 226, 52, 155, 228, 159, 173, 82, 123, 95, 153, 232, 181, 241, 213, 78, 177, 206, 218, 163, 176, 102, 167, 228, 28, 198, 133]);
  const myAccount = anchor.web3.Keypair.fromSecretKey(secretKey); // 获取密钥对
  console.log("myAccount is :", myAccount.publicKey.toBase58);


  // 参与者密钥2
  let secretKey2 = Uint8Array.from([76, 63, 49, 163, 137, 165, 168, 32, 121, 162, 204, 13, 20, 223, 35, 79, 171, 7, 32, 84, 63, 77, 242, 202, 73, 231, 100, 90, 24, 113, 47, 110, 117, 147, 223, 161, 78, 65, 8, 55, 185, 108, 117, 224, 84, 102, 234, 187, 198, 17, 193, 39, 10, 200, 0, 181, 57, 45, 111, 54, 213, 90, 246, 123]);
  const myAccount2 = anchor.web3.Keypair.fromSecretKey(secretKey2); // 获取密钥
  console.log("myAccount is :", myAccount2.publicKey.toBase58);

  const program = anchor.workspace.TestStructureArray as Program<TestStructureArray>;

  const userInfoPDA = anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("user_info_vec")], program.programId)[0]

  const devConnection = new Connection('https://devnet.helius-rpc.com/?api-key=ad4acf69-6c69-4edf-bccc-28397c4956e9')
  // const devConnection = new Connection('http://localhost:8899')
  const decimals = 9;

  const mintAuthority = myAccount;
  const metaplex = new Metaplex(devConnection).use(
    keypairIdentity(mintAuthority)
  );



  // let initAccounts = {
  //   userinfo: userInfoPDA,
  //   // user: myAccount.publicKey,
  //   tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的token account账户
  //   vaultTokenAccount: tokenVault,
  //   senderTokenAccount: tokenAccount.address, // 发送token的账户
  //   mintOfTokenBeingSent: mint_PROGRAM_ID, // mint-token地址
  //   signer: mintAuthority.publicKey,
  // }

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    // const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);

    let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息
    console.log("config:", cfg)
  });


  // it("init USDT", async () => {
  //   let a = 1;
  //   console.log("创建mint token 账户", a);
  //   // const createdSFT = await metaplex.nfts().createSft({
  //   //   uri: "https://shdw-drive.genesysgo.net/AzjHvXgqUJortnr5fXDG2aPkp2PfFMvu4Egr57fdiite/PirateCoinMeta",
  //   //   name: "USDT",
  //   //   symbol: "USDT",
  //   //   sellerFeeBasisPoints: 100,
  //   //   updateAuthority: mintAuthority,
  //   //   mintAuthority: mintAuthority,
  //   //   decimals: decimals,
  //   //   tokenStandard: TokenStandard.Fungible, // 表示你正在创建或操作的是同质化代币。
  //   //   isMutable: true,
  //   // });

  //   // console.log("创建mint token 账户", createdSFT);
  // });

  // it("trx", async () => {

  //   const lib_PROGRAM_ID = new PublicKey("FZhV3Aw5FFit8ro3QtDJaNJDoPYDeWybqnV7GkSLLqFn");
  //   // // 生成pda账户-----------------------
  //   let [tokenAccountOwnerPda] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("token_account_owner_pda")], // seeds 为
  //     lib_PROGRAM_ID
  //   );
  //   console.log("tokenAccountOwnerPda", tokenAccountOwnerPda.toString()); // program 关联的pda账户

  //   let [tokenVault] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("token_vault"), mint_PROGRAM_ID.toBuffer()], // seed："token_vaul",mint token账户地址
  //     lib_PROGRAM_ID // 关联程序的 id 地址：6TSS1cxG28NBFjLEnoZtPQLNTjtW2o2Xa6yJju5coMqg
  //   );
  //   console.log("VaultAccount: " + tokenVault);

  //   // 获取token account 地址
  //   const tokenAccount = await getOrCreateAssociatedTokenAccount(
  //     devConnection,
  //     mintAuthority,
  //     mint_PROGRAM_ID,
  //     mintAuthority.publicKey
  //   );


  //   let initAccounts = {
  //     userinfo: userInfoPDA,
  //     // user: myAccount.publicKey,
  //     tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的token account账户
  //     vaultTokenAccount: tokenVault,
  //     senderTokenAccount: tokenAccount.address, // 发送token的账户
  //     mintOfTokenBeingSent: mint_PROGRAM_ID, // mint-token地址
  //     signer: mintAuthority.publicKey,
  //   }

  // });

  // it("user_ido", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.userIdo(new anchor.BN(10)).accounts(initAccounts).rpc();
  //   console.log("Your transaction signature", tx);

  //   let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息
  //   console.log("config:", cfg)
  // });

  // 参与者权限问题,无法访问 UserInfoVec 集合

  // // 参与者2
  // it("user_ido2", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.userIdo(new anchor.BN(10)).accounts(initAccounts).signers([myAccount, myAccount2]).rpc();
  //   console.log("Your transaction signature", tx);

  //   let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息
  //   console.log("config:", cfg)
  // })

  // it("user_claim", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.userClaim().accounts(initAccounts).signers([myAccount]).rpc();
  //   console.log("Your transaction signature", tx);

  //   let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息
  //   console.log("config:", cfg)
  // });


});
