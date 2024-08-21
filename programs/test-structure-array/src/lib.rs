use anchor_lang::prelude::*;
// use std::str::FromStr;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

declare_id!("FZhV3Aw5FFit8ro3QtDJaNJDoPYDeWybqnV7GkSLLqFn");

#[program]
pub mod test_structure_array {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        // msg!("_ctx.bumps.userinfo {:?}", _ctx.bumps.userinfo);

        _ctx.accounts.userinfo.bump = _ctx.bumps.userinfo;
        // msg!("Greetings from: {:?}", _ctx.program_id);
        // msg!("userinfo PDA: {:?}", _ctx.accounts.userinfo.key());
        // msg!("userinfo Bump: {:?}", _ctx.accounts.userinfo.bump);


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



        _ctx.accounts.userinfo.user.push( _ctx.accounts.signer.key());
        _ctx.accounts.userinfo.amount.push(_amount);


        msg!("插入当前_amount: {:?}",_amount);
        msg!("user{:?}",_ctx.accounts.userinfo.user);
        msg!("amount{:?}",_ctx.accounts.userinfo.amount);

        
        Ok(())
    }

    pub fn user_claim(_ctx: Context<UserClaim>) -> Result<()> {
        // require!(ctx.accounts.config.is_claim == true, ErrorCode::CannotClaim); 
        
        if let Some(pos) = _ctx.accounts.userinfo.user.iter().position(|&x| x == _ctx.accounts.user.key()) { 
            println!("Found 30 at index: {}", pos); // 输出: Found 30 at index: 2
            msg!("_ctx.accounts.signer 的位置{}",pos);

            if let Some(value) =  _ctx.accounts.userinfo.amount.get_mut(pos){
                *value = 0;
            }
            msg!("amount{:?}",_ctx.accounts.userinfo.amount);
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init_if_needed,
        space = 8 + UserInfoVec::INIT_SPACE,
        payer = signer,
        seeds = [b"user_info_vec"],
        bump,
    )]
    pub userinfo: Account<'info, UserInfoVec>,

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    token_program: Program<'info, Token>, // 代币程序


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
    
    vault_token_account: Account<'info, TokenAccount>,
    mint_of_token_being_sent: Account<'info, Mint>,

}

#[derive(Accounts)]
pub struct UserIdo<'info> {
     #[account(mut)] 
    pub signer: Signer<'info>, 
     /// CHECK: This account is the transaction initiator and is used only to identify the sender.
    pub user: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    token_program: Program<'info, Token>, // 代币程序

    // #[account(
    //     init_if_needed,
    //     space = 8 + UserInfoVec::INIT_SPACE,
    //     payer = signer,
    //     seeds = [b"user_info_vec"],
    //     bump,
    // )]
    #[account(
        seeds = [b"user_info_vec"],
        bump = userinfo.bump,
    )]
    pub userinfo: Account<'info, UserInfoVec>,
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
    vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]   // 发送方的代币账户
    sender_token_account: Account<'info, TokenAccount>,

    mint_of_token_being_sent: Account<'info, Mint>,


}

// 用户 领币
#[derive(Accounts)]
pub struct UserClaim<'info> {
    // #[account(mut)] 
    // pub signer: Signer<'info>, 
     /// CHECK: This account is the transaction initiator and is used only to identify the sender.
    pub user: AccountInfo<'info>,
    pub system_program: Program<'info, System>,

    // #[account(
    //     seeds = [
    //         b"ido_config", 
    //     ],
    //     bump = config.bump,
    // )]
    // pub config: Account<'info, ConfigInfo>,
    
    #[account(
        seeds = [b"user_info_vec"],
        bump = userinfo.bump,
    )]
    pub userinfo: Account<'info, UserInfoVec>,





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
    pub bump: u8, // 0-255
}



#[error_code]
pub enum ErrorCode {
    #[msg("Not owner")]
    NotOwner,

    #[msg("cannot ido")]
    CannotIdo,

    #[msg("cannot claim")]
    CannotClaim,
}