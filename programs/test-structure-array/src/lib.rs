use anchor_lang::prelude::*;
// use std::str::FromStr;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

declare_id!("Aw9VRHGgHeW2MsSJuxkS7nHxdzbQQnSErQP45RFysKW8");

#[program]
pub mod test_structure_array {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        
        msg!("token_account_owner_pda: {:?}", _ctx.accounts.token_account_owner_pda.key());
        msg!("vault_token_account: {:?}", _ctx.accounts.vault_token_account.key());
        msg!("mint_of_token_being_sent: {:?}", _ctx.accounts.mint_of_token_being_sent.key());
        Ok(())
    }

    pub fn InitConfig(_ctx: Context<InitConfig>) -> Result<()> {

        msg!("Greetings from: {:?}", _ctx.program_id);
        _ctx.accounts.userinfo.bump = _ctx.bumps.userinfo;
        msg!("userinfo PDA: {:?}", _ctx.accounts.userinfo.key());
        msg!("userinfo Bump: {:?}", _ctx.accounts.userinfo.bump);

        // _ctx.accounts.userinfo.user = vec![Pubkey::from_str("").unwrap(); 10];
        // _ctx.accounts.userinfo.amount = vec![0; 10];

        Ok(())
    }



    pub fn user_ido(_ctx: Context<UserIdo>,  _amount: u64) -> Result<()> {
       
        // require!(_ctx.accounts.config.is_ido == true, ErrorCode::CannotIdo); 

        // 以下是我们要发送给 Token 程序的实际指令。
        let transfer_instruction = Transfer { // 创建转账指令
            from: _ctx.accounts.sender_token_account.to_account_info(),
            to: _ctx.accounts.vault_token_account.to_account_info(),
            authority: _ctx.accounts.signer.to_account_info(),
        };

        let cpi_ctx = CpiContext::new( // 创建CPI上下文
            _ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );

        anchor_spl::token::transfer(cpi_ctx, _amount)?; // 调用token程序的转账函数 // 无返回值

        if let Some(pos) = _ctx.accounts.userinfo.user.iter().position(|&x| x == _ctx.accounts.signer.key()) { 
            println!("Found 30 at index: {}", pos); // 输出: Found 30 at index: 2
            msg!("_ctx.accounts.signer 的位置{}",pos);

            if let Some(value) =  _ctx.accounts.userinfo.amount.get_mut(pos){
                *value +=  _amount;
            }
            msg!("add{:?}",_ctx.accounts.userinfo.amount);
        }else{
            _ctx.accounts.userinfo.user.push( _ctx.accounts.signer.key());
            _ctx.accounts.userinfo.amount.push(_amount);
            msg!("amount {:?}",_amount)
        }

        msg!("userinfo PDA: {:?}", _ctx.accounts.userinfo.key());
        msg!("userinfo Bump: {:?}", _ctx.accounts.userinfo.bump);

       
        msg!("插入当前_amount: {:?}",_amount);
        msg!("user{:?}",_ctx.accounts.userinfo.user);
        msg!("amount{:?}",_ctx.accounts.userinfo.amount);
        msg!("user len {:?}", _ctx.accounts.userinfo.user.len());
        msg!("amount len {:?}", _ctx.accounts.userinfo.amount.len());
        
        Ok(())
    }

    pub fn user_claim(_ctx: Context<UserClaim>) -> Result<()> {
        // require!(ctx.accounts.config.is_claim == true, ErrorCode::CannotClaim); 
        
        if let Some(pos) = _ctx.accounts.userinfo.user.iter().position(|&x| x == _ctx.accounts.signer.key()) { 
            println!("Found 30 at index: {}", pos); // 输出: Found 30 at index: 2
            msg!("_ctx.accounts.signer 的位置{}",pos);

            if let Some(value) =  _ctx.accounts.userinfo.amount.get_mut(pos){
                let _amount = *value;
                *value = 0;
                // Below is the actual instruction that we are going to send to the Token program. 以下是我们要发送给Token程序的实际指令
                // 获取token-account账户
                let token_account =  anchor_spl::associated_token::get_associated_token_address(&_ctx.accounts.signer.key(),&_ctx.accounts.mint_of_token_being_sent.key());
                msg!("&_ctx.accounts.signer.key() {}",&_ctx.accounts.signer.key());
                msg!("&_ctx.accounts.mint_of_token_being_sent.key() {}",&_ctx.accounts.mint_of_token_being_sent.key());
                msg!("_amount {}",_amount);
                msg!("token_account {}",token_account);
                msg!("ctx.accounts.sender_token_account.to_account_info() {:?}",_ctx.accounts.sender_token_account.to_account_info());
                msg!("ctx.accounts.sender_token_account{:?}",_ctx.accounts.sender_token_account);

                require!(_ctx.accounts.sender_token_account.key() == token_account, ErrorCode::ErrorAccount);  // 判断，传递的ata账户与程序计算的ata账户是否相同

                msg!("ctx.accounts.sender_token_account.key() {:?}",_ctx.accounts.sender_token_account.key());
                // require!(_ctx.accounts.sender_token_account.key() == _ctx.accounts.signer.key(), ErrorCode::ErrorAccount); 
              
                let transfer_instruction = Transfer { // 创建转账指令
                    from: _ctx.accounts.vault_token_account.to_account_info(),
                    to: _ctx.accounts.sender_token_account.to_account_info(),
                    authority: _ctx.accounts.token_account_owner_pda.to_account_info(), 
                };

                let bump = _ctx.bumps.token_account_owner_pda; // 获取bump种子
                let seeds = &[b"token_account_owner_pda".as_ref(), &[bump]];
                let signer = &[&seeds[..]];

                let cpi_ctx = CpiContext::new_with_signer( // 创建带有签名的CPI上下文
                    _ctx.accounts.token_program.to_account_info(),
                    transfer_instruction,
                    signer,
                );
                anchor_spl::token::transfer(cpi_ctx, _amount)?; // 调用token程序的转账函数
            }
        }
        Ok(())
    }


    pub fn select_info(_ctx: Context<SelectInfo>) -> Result<()> {
        msg!("userinfo PDA: {:?}", _ctx.accounts.userinfo.key());
        msg!("userinfo Bump: {:?}", _ctx.accounts.userinfo.bump);
        msg!("user len {:?}", _ctx.accounts.userinfo.user.len());
        msg!("amount len {:?}", _ctx.accounts.userinfo.amount.len());
        msg!("user{:?}",_ctx.accounts.userinfo.user);
        msg!("amount{:?}",_ctx.accounts.userinfo.amount);
        
        Ok(())
    }



    // 1. fun： 转出所有usdt，给部署者合约账户方法
    // 2. 判断config配置文件方法


    // 3. fun： 转入ent方法
    // 4. 添加转出ent的

}
#[derive(Accounts)]
pub struct Initialize<'info> {
    // Derived PDAs // 衍生 PDA
    #[account(  // 初始化或需要时创建PDA账户
        init_if_needed,
        payer = signer,
        seeds=[b"token_account_owner_pda"],
        bump,
        space = 8
    )]
    /// CHECK: This is safe because this account is a PDA derived from a known seed.
    token_account_owner_pda: AccountInfo<'info>,

    #[account(   // 初始化或需要时创建代币账户
        init_if_needed,
        payer = signer,
        seeds=[b"token_vault", mint_of_token_being_sent.key().as_ref()],
        token::mint=mint_of_token_being_sent,
        token::authority=token_account_owner_pda,
        bump
    )]
    vault_token_account: Box<Account<'info, TokenAccount>>,
    mint_of_token_being_sent: Box<Account<'info, Mint>>,

    #[account(mut)]
    signer: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>, // 代币程序
    rent: Sysvar<'info, Rent> // 租金系统变量
}


#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    system_program: Program<'info, System>,

    #[account(
        init_if_needed,
        space = 8 + UserInfoVec::INIT_SPACE,
        payer = signer,
        seeds = [b"user_info_vec"],
        bump
    )]
    pub userinfo: Account<'info, UserInfoVec>

}

#[derive(Accounts)]
pub struct UserIdo<'info> {
    
    #[account(
        mut,
        seeds = [b"user_info_vec"],
        bump = userinfo.bump,
    )]
    userinfo: Account<'info, UserInfoVec>,
    // #[account(
    //     seeds = [
    //         b"ido_config", 
    //     ],
    //     bump = config.bump,
    // )]
    // pub config: Account<'info, ConfigInfo>,



     // Derived PDAs
     #[account(mut, // 需要时更新的PDA账户
        seeds=[b"token_account_owner_pda"],
        bump
    )]
    /// CHECK: This is safe because this account is a PDA derived from a known seed.
    token_account_owner_pda: AccountInfo<'info>,

    #[account(mut, // 需要时更新的代币账户
        seeds=[b"token_vault", mint_of_token_being_sent.key().as_ref()],
        bump,
        token::mint=mint_of_token_being_sent,
        token::authority=token_account_owner_pda,
    )]
    vault_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]   // 发送方的代币账户
    sender_token_account: Box<Account<'info, TokenAccount>>,
    mint_of_token_being_sent: Box<Account<'info, Mint>>,

    #[account(mut)] 
    signer: Signer<'info>, 
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>, // 代币程序
    rent: Sysvar<'info, Rent>, // 租金系统变量
}

// 用户 领币
#[derive(Accounts)]
pub struct UserClaim<'info> {
    #[account(mut)] 
    pub signer: Signer<'info>, 
    pub system_program: Program<'info, System>,
    token_program: Program<'info, Token>, // 代币程序
    rent: Sysvar<'info, Rent>, // 租金系统变量

    // #[account(
    //     seeds = [
    //         b"ido_config", 
    //     ],
    //     bump = config.bump,
    // )]
    // pub config: Account<'info, ConfigInfo>,
    
    #[account(
        mut,
        seeds = [b"user_info_vec"],
        bump = userinfo.bump,
    )]
    pub userinfo: Account<'info, UserInfoVec>,


     // Derived PDAs
     #[account(mut, // 需要时更新的PDA账户
        seeds=[b"token_account_owner_pda"],
        bump
    )]
    /// CHECK: This is safe because this account is a PDA derived from a known seed.
    token_account_owner_pda: AccountInfo<'info>,

    #[account(mut, // 需要时更新的代币账户
        seeds=[b"token_vault", mint_of_token_being_sent.key().as_ref()],
        bump,
        token::mint=mint_of_token_being_sent,
        token::authority=token_account_owner_pda,
    )]
    vault_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]   // 发送方的代币账户
    sender_token_account: Box<Account<'info, TokenAccount>>,
    mint_of_token_being_sent: Box<Account<'info, Mint>>,

}

#[derive(Accounts)]
pub struct SelectInfo<'info> {
    
    #[account(
        seeds = [b"user_info_vec"],
        bump = userinfo.bump,
    )]
    userinfo: Account<'info, UserInfoVec>,

        // #[account(
    //     seeds = [
    //         b"ido_config", 
    //     ],
    //     bump = config.bump,
    // )]
    // pub config: Account<'info, ConfigInfo>,

    #[account(mut)] 
    signer: Signer<'info>, 
    system_program: Program<'info, System>
}


#[account] 
#[derive(InitSpace)]
pub struct UserInfoVec {
    //  10 MiB，你需要根据你存储的类型（如 Pubkey 或 u64）来计算可以存储的最大元素数量，
    // Vec<Pubkey> =   ≈163,840 个元素
    // Vec<u64> = 655,360 个元素
    #[max_len(100)] // 指定Vec的最大长度为100
    pub user: Vec<Pubkey>,  // 存储键
    #[max_len(100)] 
    pub amount: Vec<u64>,   // 存储值
    // pub user: Vec<Pubkey>,  // 存储键
    // pub amount: Vec<u64>,   // 存储值
    // pub len: u64,
    pub bump: u8, // 0-255
}

// 修改为添加成数组
// 在新项目中测试添加vec





#[error_code]
pub enum ErrorCode {
    #[msg("Not owner")]
    NotOwner,

    #[msg("cannot ido")]
    CannotIdo,

    #[msg("cannot claim")]
    CannotClaim,

    #[msg("error account")]
    ErrorAccount,
}