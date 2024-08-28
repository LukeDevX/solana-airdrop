# solana-airdrop
solana，转账，添加白名单，发放空投  

1u = 1 / 0.0005 ent = 2000ent  

本地网，本地部署花费 2.56209432 ————字节 367989   
开发网网部署，4sol

不加Box，只能存 200 初始化不报错

# 待实现
1. 

# 待测试


2. 测试 不同大小数组部署程序sol的消耗
     验证：部署合约2sol，数据账户最大2sol（是否等于10kb）

# 已完成
1. 转入usdt,按比例添加到数组中;领取时转出ent  
2. 转出usdt,ent
3. 全局config配置文件  
4. 获得userinfo，pda地址，在新合约中调用。账户1和账户2 
     数据跟合约绑定，第一次的合约才可以调用



# 优化
1. 修改ower拥有的token account(pad)的生成规则,使得可以直接给owner mint代币时的地址是同一个地址.  
    思路: ①. 修改ts中token,pda账户生成规则.(直接去掉字符串""seed无法生成相同的的adder)  
         ②  修改 rs中 token account的验证规则  
2. 将rs中提取合约中 usdt 和 ent 到部署者账户方法合并  
    思路: ①. 在指令账户中区分 usdt和ent  
          ②. 函数cpi调用区分.  
3. 账户大小最大10k，100个用户
     思路，零拷贝


# 注意
1. phantom 转入 token 方法，可以直接给ata账户和solana账户转账，转账前合约地址必须存在  
2. 有mint账户后,给转账owner转账,无mint账户, 账户默认会转给 seed生成账户  





# solana-ido

加载环境  
yarn install  
运行test测试文件  
yarn test  


# 相关密钥和地址

ido 部署者私钥：csocdQ15irZVCExB7SUzpmSVfPYZygzouwCTpd2f1Au3gURmQJp34NSWEGhshQ8rPSe6zgZMR2g9h5fJHS4qiui
十进制密钥：
[30,240,35,42,27,238,200,249,187,255,152,130,199,65,213,144,146,160,154,79,58,104,177,56,233,17,243,160,122,151,197,253,134,27,181,206,132,195,226,52,155,228,159,173,82,123,95,153,232,181,241,213,78,177,206,218,163,176,102,167,228,28,198,133]

部署者公钥：A2W9314MCgkYBJzCoS3aPsgFeMayeQC8naELBQU6W9JL  

ido合约地址：9Rbdop6mpjsKFBdvZuuixs32xdGQujmA1kuAyxLN9vxn  
合约pad管理地址:Gh6gxSWuqtpbT99svmzUA8U8PRruGEjE2Vmp2cKMFqAk  
合约 usdt Vault 地址: 2wgjBz6EnjnVRJ1xeEueBBS3cQAowCCcS23rSAGoKys4  
合约 ent Vault 地址: B8AErr1pLeaUDqABSuzTvGNmNycry3KtqHru8QkbnPoN  

mint usdt 地址 = 4GMWAa3hMjbPe2C1hwuB3huFGjVFYDrpo5wu6mEQFSKG  
mint ent 地址 = 5Y6MQYxbyDMr1jbUPLCst3iVhS8bWwgSTo6tjoct2ypK

用户信息存储地址：BvT2XzdqwJpMmhPhUb12v7dgj6LQkKAuy55x61tbSkDg  
合约配置信息存储地址：HoewnpUMXCzArk87boHdKeXXQkaznkgYfkmwnt9hdejY  


# 注意
- 1u = 1 / 0.0005 ent = 2000ent  
- 默认只能存 200个用户 （2sol）

# 常见错误


