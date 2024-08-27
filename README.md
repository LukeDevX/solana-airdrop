# solana-airdrop
solana，转账，添加白名单，发放空投  

1u = 1 / 0.0005 ent = 2000ent  

# 待实现


# 待测试
1. 转出usdt,ent  
2. 判断config配置文件方法  
3. 有mint账户后,给转账owner转账,默认会转到mint账户中  
    测试----无mint账户,账户是否会转给 seed生成账户  

4. 获得userinfo，pda地址，在新合约中调用。账户1和账户2  
5. 测试 不同大小数组部署程序sol的消耗

# 已完成
1. 转入usdt,按比例添加到数组中;领取时转出ent  


# 优化
1. 修改ower拥有的token account(pad)的生成规则,使得可以直接给owner mint代币时的地址是同一个地址.  
    思路: ①. 修改ts中token,pda账户生成规则.(直接去掉字符串""seed无法生成相同的的adder)  
         ②  修改 rs中 token account的验证规则  
2. 将rs中提取合约中 usdt 和 ent 到部署者账户方法合并  
    思路: ①. 在指令账户中区分 usdt和ent  
          ②. 函数cpi调用区分.  


# 注意
1. phantom 转入 token 方法，可以直接给ata账户和solana账户转账，转账前合约地址必须存在  


