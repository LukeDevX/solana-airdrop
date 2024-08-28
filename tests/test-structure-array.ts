import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TestStructureArray } from "../target/types/test_structure_array";

import { describe, it } from 'mocha';
import "dotenv/config"; // 加载dev配置文件

import { Keypair, Connection, PublicKey } from "@solana/web3.js";

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

// it.skip 跳过用例
describe("test-structure-array", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());


  // 部署者密钥1
  let secretKey = Uint8Array.from([30, 240, 35, 42, 27, 238, 200, 249, 187, 255, 152, 130, 199, 65, 213, 144, 146, 160, 154, 79, 58, 104, 177, 56, 233, 17, 243, 160, 122, 151, 197, 253, 134, 27, 181, 206, 132, 195, 226, 52, 155, 228, 159, 173, 82, 123, 95, 153, 232, 181, 241, 213, 78, 177, 206, 218, 163, 176, 102, 167, 228, 28, 198, 133]);
  const myAccount = anchor.web3.Keypair.fromSecretKey(secretKey); // 获取密钥对
  console.log("myAccount1 is :", myAccount.publicKey.toBase58);


  // 参与者密钥2
  let secretKey2 = Uint8Array.from([76, 63, 49, 163, 137, 165, 168, 32, 121, 162, 204, 13, 20, 223, 35, 79, 171, 7, 32, 84, 63, 77, 242, 202, 73, 231, 100, 90, 24, 113, 47, 110, 117, 147, 223, 161, 78, 65, 8, 55, 185, 108, 117, 224, 84, 102, 234, 187, 198, 17, 193, 39, 10, 200, 0, 181, 57, 45, 111, 54, 213, 90, 246, 123]);
  const myAccount2 = anchor.web3.Keypair.fromSecretKey(secretKey2); // 获取密钥
  console.log("myAccount2 is :", myAccount2.publicKey.toBase58);

  const program = anchor.workspace.TestStructureArray as Program<TestStructureArray>;

  const userInfoPDA = anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("user_info_vec")], program.programId)[0]
  const cfgPDA = anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("ido_config")], program.programId)[0]
  console.log("userInfoPDA:", userInfoPDA)
  console.log("cfgPDA:", cfgPDA)

  const lib_PROGRAM_ID = new PublicKey("2yj1eyrGfhaveP39nHYpgbo5TK2jaP3uoBPtdyQgqdpW");
  const mint_usdt_ID = new PublicKey("7QKkh5XozczWdw3gYATfn1mftUt8PqupumsEDiGKKaXJ");
  const mint_ent_ID = new PublicKey("6vmMAZrdNje9bDRRNEjnnnjtUNTo8Z8bByyi4zpv4ehR");

  // // 生成pda账户-----------------------
  let [tokenAccountOwnerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_account_owner_pda")], // seeds 为
    lib_PROGRAM_ID
  );
  console.log("tokenAccountOwnerPda", tokenAccountOwnerPda.toString()); // program 关联的token account owner pda账户 

  // tokenAccountOwnerPda CmFHEBTdEXkCUGXdQfJqgdZSfMKRM9t45L9kJFnF4Zez
  // usdt VaultAccount: 7gLs8yJgNFNoTjNLCP2oySjpN7Xj3eVLti2UEqgWi3ie
  //      mint 生成:  EvPJ3b4SykqEFeTgAxvrdkhaUdgG1P7axLsUHu7KenB4
  // ent VaultAccount(seed-tokenvalue): 7PhmoFPQ5NkgmV9XC2qdeEWX375FfyjiNnsfis7zx6fx
  //     mint时生成: 6hZQPWnELWm9AEwVyVpTNLMyiUHeaazS2ciFKzTofXxv
  // (无seed)7iHFygeCrUgitpohCRy1xynsJLqQndhuMfj5XoMnXkiz

  // test value:FKdVqegqBY527oBF5KY7M15zuUtQP8Trxu5HfnESDtXf



  // const devConnection = new Connection('https://devnet.helius-rpc.com/?api-key=ad4acf69-6c69-4edf-bccc-28397c4956e9')
  const devConnection = new Connection('https://devnet-rpc.shyft.to?api_key=8VafiPaClmnwic-h')


  // const devConnection = new Connection('http://localhost:8899')
  const decimals = 9;
  const mintDecimals = Math.pow(10, decimals);
  const mintAuthority = myAccount;
  const metaplex = new Metaplex(devConnection).use(
    keypairIdentity(mintAuthority)
  );
  // devnet 可以正常创建，报错信息中有mintaccount地址
  // localnet 无法创建，报错：程序地址无法找到：Transaction simulation failed: Attempt to load a program that does not exist.

  it.skip("Is initialized!", async function () {
    this.timeout(30000);
    let [tokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), mint_usdt_ID.toBuffer()], // seed："token_vaul",mint token账户地址
      lib_PROGRAM_ID // 关联程序的地址
    );
    console.log("合约 usdt Vault Account: " + tokenVault);

    // 获取发送者的 token account 地址
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      devConnection,
      mintAuthority, // 支付创建账户费用的账户的Keypair 
      mint_usdt_ID,
      mintAuthority.publicKey  //获取哪个账户的tokenAccout
    );

    console.log("tokenAccount: ", tokenAccount);

    console.log("userInfoPDA:", userInfoPDA)
    console.log("mintAuthority.publicKey:", mintAuthority.publicKey)
    let initAccounts = {
      tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的拥有者账户
      vaultTokenAccount: tokenVault, //接收代币的地址
      senderTokenAccount: tokenAccount.address, // 发送token的账户
      mintOfTokenBeingSent: mint_usdt_ID, // mint-token地址
      signer: mintAuthority.publicKey,
    }

    // Add your test here.
    // const tx = await program.methods.initialize().rpc();
    const tx = await program.methods.initialize().accounts(initAccounts).signers([mintAuthority]).rpc();
    console.log("Your transaction signature", tx);


    let [tokenVaultent] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), mint_ent_ID.toBuffer()], // seed："token_vaul",mint token账户地址
      lib_PROGRAM_ID // 关联程序的地址
    );
    console.log("合约 ent Vault Account: " + tokenVaultent);

    const tokenAccountent = await getOrCreateAssociatedTokenAccount(
      devConnection,
      mintAuthority, // 支付创建账户费用的账户的Keypair 
      mint_ent_ID,
      mintAuthority.publicKey  //获取哪个账户的tokenAccout
    );

    console.log("tokenAccountent: ", tokenAccountent);
    let initAccounts2 = {
      tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的token account账户
      vaultTokenAccount: tokenVaultent, //接收代币的地址
      senderTokenAccount: tokenAccountent.address, // 发送token的账户
      mintOfTokenBeingSent: mint_ent_ID, // mint-token地址
      signer: mintAuthority.publicKey,
    }
    const tx2 = await program.methods.initialize().accounts(initAccounts2).signers([mintAuthority]).rpc();
  });

  it.skip("InitConfig!", async function () {
    this.timeout(30000);
    console.log("userInfoPDA:", userInfoPDA)
    console.log("mintAuthority.publicKey:", mintAuthority.publicKey)
    let initAccounts = {
      config: cfgPDA,
      userinfo: userInfoPDA,
      signer: mintAuthority.publicKey
    }

    // Add your test here.
    // const tx = await program.methods.initialize().rpc();
    const tx = await program.methods.initConfig().accounts(initAccounts).signers([mintAuthority]).rpc();
    console.log("Your transaction signature", tx);

  });


  it.skip("update config", async function () {
    this.timeout(30000);
    console.log("update config")
    let configaccount = myAccount
    // const tx = await program.methods.updateConfig(true, true).accounts({ // 设置是否可以 is_ido 和 is_claim
    //   systemProgram: anchor.web3.SystemProgram.programId, // 构建传入指令
    //   admin: myAccount.publicKey,
    //   config: cfgPDA, // config地址
    // }).rpc();
    const updateConfig = {  // 构建传入更新指令
      // systemProgram: anchor.web3.SystemProgram.programId,
      signer: configaccount.publicKey,
      config: cfgPDA, // config地址
    };
    const tx = await program.methods.updateConfig(true, true).accounts(updateConfig).signers([configaccount]).rpc(); // 设置是否可以 is_ido 和 is_claim
    // bump 255
    // seed：ido_config

    console.log("Your transaction signature", tx);
    let cfg = await program.account.configInfo.fetch(cfgPDA); // 获取config 的 pda信息
    console.log("config:", cfg)

  });

  // 
  it.skip("create mint accout", async function () {
    this.timeout(30000);

    // 检查网络连接版本
    // devConnection.getVersion().then(version => {
    //   console.log("Solana version:", version);
    // }).catch(error => {
    //   console.error("Failed to get version:", error);
    // });
    // // 检查账户余额
    // devConnection.getBalance(myAccount.publicKey).then(balance => {
    //   console.log("Account balance (in lamports):", balance);
    // }).catch(error => {
    //   console.error("Failed to get balance:", error);
    // });

    const createdSFT = await metaplex.nfts().createSft({
      uri: "https://chatgpt.jingyanclub.tech/ENTCoinMeta",
      // uri: "https://shdw-drive.genesysgo.net/AzjHvXgqUJortnr5fXDG2aPkp2PfFMvu4Egr57fdiite/PirateCoinMeta",
      name: "test0815",
      symbol: "test0815",
      sellerFeeBasisPoints: 100,
      updateAuthority: mintAuthority,
      mintAuthority: mintAuthority,
      decimals: decimals,
      tokenStandard: TokenStandard.Fungible, // 表示你正在创建或操作的是同质化代币。
      isMutable: true,
    });
  });

  // mint 代币
  it.skip("mint token", async function () {
    this.timeout(30000);
    let mintaccount = mint_ent_ID
    let mintResult = await metaplex.nfts().mint({
      nftOrSft: { address: mintaccount, tokenStandard: TokenStandard.Fungible },
      authority: mintAuthority,
      toOwner: myAccount.publicKey,
      amount: token(99999 * mintDecimals),
    });
    console.log("Mint to result: " + mintResult.response.signature);
  });

  // 转账给合约-1
  it.skip("user_ido", async function () {
    this.timeout(30000);

    // // 生成pda账户-----------------------
    let [tokenAccountOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_account_owner_pda")], // seeds 为
      lib_PROGRAM_ID
    );
    console.log("tokenAccountOwnerPda", tokenAccountOwnerPda.toString()); // program 关联的token account owner pda账户

    let [tokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), mint_usdt_ID.toBuffer()], // seed："token_vaul",mint token账户地址
      lib_PROGRAM_ID // 关联程序的地址
    );
    console.log("VaultAccount: " + tokenVault);

    // 获取发送者的 token account 地址
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      devConnection,
      mintAuthority, // 支付创建账户费用的账户的Keypair 
      mint_usdt_ID,
      mintAuthority.publicKey  //获取哪个账户的tokenAccout
    );

    console.log("tokenAccount: " + tokenAccount);

    let initAccounts = {
      userinfo: userInfoPDA,
      // user: myAccount.publicKey,
      tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的token account账户
      vaultTokenAccount: tokenVault, //接收代币的地址
      senderTokenAccount: tokenAccount.address, // 发送token的账户
      mintOfTokenBeingSent: mint_usdt_ID, // mint-token地址
      signer: mintAuthority.publicKey,
    }

    // Add your test here.
    const tx = await program.methods.userIdo(new anchor.BN(1 * mintDecimals)).accounts(initAccounts).signers([mintAuthority]).rpc();
    console.log("Your transaction signature", tx);

    let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息
    console.log("config:", cfg)
  });

  // 参与者权限问题,无法访问 UserInfoVec 集合

  // 参与者2-2
  it.skip("user_ido2", async function () {
    this.timeout(30000);
    let userido = myAccount2;
    // // 生成pda账户-----------------------
    let [tokenAccountOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_account_owner_pda")], // seeds 为
      lib_PROGRAM_ID
    );
    console.log("tokenAccountOwnerPda", tokenAccountOwnerPda.toString()); // program 关联的token account owner pda账户

    let [tokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), mint_usdt_ID.toBuffer()], // seed："token_vaul",mint token账户地址
      lib_PROGRAM_ID // 关联程序的地址
    );
    console.log("VaultAccount: " + tokenVault);

    // 获取发送者的 token account 地址
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      devConnection,
      userido, // 支付创建账户费用的账户的Keypair 
      mint_usdt_ID,
      userido.publicKey  //获取哪个账户的tokenAccout
    );

    console.log("tokenAccount: " + tokenAccount);

    let initAccounts = {
      userinfo: userInfoPDA,
      // user: myAccount.publicKey,
      tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的token account账户
      vaultTokenAccount: tokenVault, //接收代币的地址
      senderTokenAccount: tokenAccount.address, // 发送token的账户
      mintOfTokenBeingSent: mint_usdt_ID, // mint-token地址
      signer: userido.publicKey,
    }

    // Add your test here.
    const tx = await program.methods.userIdo(new anchor.BN(2 * mintDecimals)).accounts(initAccounts).signers([userido]).rpc();
    console.log("Your transaction signature", tx);

    let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息
    console.log("config:", cfg)
  })

  it.skip("user_claim", async function () {
    this.timeout(30000);
    let claimaccount = myAccount;
    // // 生成pda账户-----------------------
    let [tokenAccountOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_account_owner_pda")], // seeds 为
      lib_PROGRAM_ID
    );
    console.log("tokenAccountOwnerPda", tokenAccountOwnerPda.toString()); // program 关联的token account owner pda账户

    let [tokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), mint_ent_ID.toBuffer()], // seed："token_vaul",mint token账户地址
      lib_PROGRAM_ID // 关联程序的地址
    );
    console.log("VaultAccount: " + tokenVault);

    // 获取发送者的 token account 地址
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      devConnection,
      claimaccount, // 支付创建账户费用的账户的Keypair 
      mint_ent_ID,
      claimaccount.publicKey  //获取哪个账户的tokenAccout
    );

    console.log("tokenAccount: " + tokenAccount);

    let initAccounts = {
      userinfo: userInfoPDA,
      // user: myAccount.publicKey,
      tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的token account账户
      vaultTokenAccount: tokenVault, //接收代币的地址
      senderTokenAccount: tokenAccount.address, // 发送token的账户
      mintOfTokenBeingSent: mint_ent_ID, // mint-token地址
      signer: claimaccount.publicKey,
    }
    let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息

    console.log("config:", cfg)
    // Add your test here.
    const tx = await program.methods.userClaim().accounts(initAccounts).signers([claimaccount]).rpc();
    console.log("Your transaction signature", tx);

    console.log("config:", cfg)
  });

  it.skip("user_claim2", async function () {
    this.timeout(30000);
    let claimaccount = myAccount2;
    // // 生成pda账户-----------------------
    let [tokenAccountOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_account_owner_pda")], // seeds 为
      lib_PROGRAM_ID
    );
    console.log("tokenAccountOwnerPda", tokenAccountOwnerPda.toString()); // program 关联的token account owner pda账户

    let [tokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), mint_ent_ID.toBuffer()], // seed："token_vaul",mint token账户地址
      lib_PROGRAM_ID // 关联程序的地址
    );
    console.log("VaultAccount: " + tokenVault);

    // 获取发送者的 token account 地址
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      devConnection,
      claimaccount, // 支付创建账户费用的账户的Keypair 
      mint_ent_ID,
      claimaccount.publicKey  //获取哪个账户的tokenAccout
    );

    console.log("tokenAccount: " + tokenAccount);

    let initAccounts = {
      userinfo: userInfoPDA,
      // user: myAccount.publicKey,
      tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的token account账户
      vaultTokenAccount: tokenVault, //接收代币的地址
      senderTokenAccount: tokenAccount.address, // 发送token的账户
      mintOfTokenBeingSent: mint_ent_ID, // mint-token地址
      signer: claimaccount.publicKey,
    }
    let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息

    console.log("config:", cfg)
    // Add your test here.
    const tx = await program.methods.userClaim().accounts(initAccounts).signers([claimaccount]).rpc();
    console.log("Your transaction signature", tx);

    console.log("config:", cfg)
  });

  // 管理员转出usdt
  it.skip("admin transfer_usdt", async function () {
    this.timeout(30000);
    let claimaccount = myAccount;
    // // 生成pda账户-----------------------
    let [tokenAccountOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_account_owner_pda")], // seeds 为
      lib_PROGRAM_ID
    );
    console.log("tokenAccountOwnerPda", tokenAccountOwnerPda.toString()); // program 关联的token account owner pda账户

    let [tokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), mint_usdt_ID.toBuffer()], // seed："token_vaul",mint token账户地址
      lib_PROGRAM_ID // 关联程序的地址
    );
    console.log("VaultAccount: " + tokenVault);

    // 获取发送者的 token account 地址
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      devConnection,
      claimaccount, // 支付创建账户费用的账户的Keypair 
      mint_usdt_ID,
      claimaccount.publicKey  //获取哪个账户的tokenAccout
    );
    console.log("tokenAccount: " + tokenAccount);
    let initAccounts = {
      tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的token account账户
      vaultTokenAccount: tokenVault, //接收代币的地址
      senderTokenAccount: tokenAccount.address, // 发送token的账户
      mintOfTokenBeingSent: mint_usdt_ID, // mint-token地址
      signer: claimaccount.publicKey,
    }
    let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息
    console.log("config:", cfg)
    // Add your test here.
    const tx = await program.methods.transferUsdt(new anchor.BN(1 * mintDecimals)).accounts(initAccounts).signers([claimaccount]).rpc();
    console.log("Your transaction signature", tx);
    console.log("config:", cfg)
  });

  // 管理员转出ent
  it.skip("admin transfer_ent", async function () {
    this.timeout(30000);
    let claimaccount = myAccount;
    // // 生成pda账户-----------------------
    let [tokenAccountOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_account_owner_pda")], // seeds 为
      lib_PROGRAM_ID
    );
    console.log("tokenAccountOwnerPda", tokenAccountOwnerPda.toString()); // program 关联的token account owner pda账户

    let [tokenVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), mint_ent_ID.toBuffer()], // seed："token_vaul",mint token账户地址
      lib_PROGRAM_ID // 关联程序的地址
    );
    console.log("VaultAccount: " + tokenVault);

    // 获取发送者的 token account 地址
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      devConnection,
      claimaccount, // 支付创建账户费用的账户的Keypair 
      mint_ent_ID,
      claimaccount.publicKey  //获取哪个账户的tokenAccout
    );
    console.log("tokenAccount: " + tokenAccount);
    let initAccounts = {
      tokenAccountOwnerPda: tokenAccountOwnerPda, // pda：程序关联的token account账户
      vaultTokenAccount: tokenVault, //接收代币的地址
      senderTokenAccount: tokenAccount.address, // 发送token的账户
      mintOfTokenBeingSent: mint_ent_ID, // mint-token地址
      signer: claimaccount.publicKey,
    }
    let cfg = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息
    console.log("config:", cfg)
    // Add your test here.
    const tx = await program.methods.transferEnt(new anchor.BN(889 * mintDecimals)).accounts(initAccounts).signers([claimaccount]).rpc();
    console.log("Your transaction signature", tx);
    console.log("config:", cfg)
  });

  it("select info", async function () {
    this.timeout(30000);
    console.log("userInfoPDA:", userInfoPDA)
    console.log("mintAuthority.publicKey:", mintAuthority.publicKey)
    let initAccounts = {
      userinfo: userInfoPDA,
      config: cfgPDA,
      signer: mintAuthority.publicKey
    }

    // Add your test here.
    // const tx = await program.methods.initialize().rpc();
    const tx = await program.methods.selectInfo().accounts(initAccounts).signers([mintAuthority]).rpc();
    console.log("Your transaction signature", tx);
  });

  // 92,998

  it("ALLconfig", async function () {
    this.timeout(30000);
    console.log("userInfoPDA:", userInfoPDA)
    console.log("cfgPDA:", cfgPDA)

    let cfg = await program.account.configInfo.fetch(cfgPDA); // 获取config 的 pda信息
    console.log("config:", cfg)
    let cfg2 = await program.account.userInfoVec.fetch(userInfoPDA); // 获取config 的 pda信息
    console.log("config:", cfg2)
  });

});
