use anchor_lang::prelude::*;
use std::str::FromStr;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

declare_id!("2yj1eyrGfhaveP39nHYpgbo5TK2jaP3uoBPtdyQgqdpW");

// 设置默认管理员公钥
pub const DEFAULT_ADMIN_KEY: &str = "A2W9314MCgkYBJzCoS3aPsgFeMayeQC8naELBQU6W9JL";


#[program]
pub mod test_structure_array {
    use super::*;

    // 初始化 转账相关账户
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    // 初始化 配置和用户信息账户
    pub fn init_config(_ctx: Context<InitConfig>) -> Result<()> {
        _ctx.accounts.userinfo.bump = _ctx.bumps.userinfo;
        _ctx.accounts.config.bump = _ctx.bumps.config;
        Ok(())
    }
      // 用户向合约转 usdt
    pub fn user_ido(_ctx: Context<UserIdo>, _amount: u64) -> Result<()> {
       
        require!(_ctx.accounts.config.is_ido == true, ErrorCode::CannotIdo); 

        let transfer_instruction = Transfer {
            from: _ctx.accounts.sender_token_account.to_account_info(),
            to: _ctx.accounts.vault_token_account.to_account_info(),
            authority: _ctx.accounts.signer.to_account_info(),
        };

        let cpi_ctx = CpiContext::new( 
            _ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );

        anchor_spl::token::transfer(cpi_ctx, _amount)?; 
        if let Some(pos) = _ctx.accounts.userinfo.user.iter().position(|&x| x == _ctx.accounts.signer.key()) { 
            if let Some(value) =  _ctx.accounts.userinfo.amount.get_mut(pos){
                *value +=  _amount * 2000;
            }
        }else{
            _ctx.accounts.userinfo.user.push( _ctx.accounts.signer.key());
            _ctx.accounts.userinfo.amount.push(_amount* 2000);
        }
        Ok(())
    }
     // 用户领取 ent 
    pub fn user_claim(_ctx: Context<UserClaim>) -> Result<()> {
        require!(_ctx.accounts.config.is_claim == true, ErrorCode::CannotClaim); 
        
        if let Some(pos) = _ctx.accounts.userinfo.user.iter().position(|&x| x == _ctx.accounts.signer.key()) { 

            if let Some(value) =  _ctx.accounts.userinfo.amount.get_mut(pos){
                let _amount = *value;
                *value = 0;
                let token_account =  anchor_spl::associated_token::get_associated_token_address(&_ctx.accounts.signer.key(),&_ctx.accounts.mint_of_token_being_sent.key());
                
                require!(_ctx.accounts.sender_token_account.key() == token_account, ErrorCode::ErrorAccount); 
              
                let transfer_instruction = Transfer {
                    from: _ctx.accounts.vault_token_account.to_account_info(),
                    to: _ctx.accounts.sender_token_account.to_account_info(),
                    authority: _ctx.accounts.token_account_owner_pda.to_account_info(), 
                };

                let bump = _ctx.bumps.token_account_owner_pda; 
                let seeds = &[b"token_account_owner_pda".as_ref(), &[bump]];
                let signer = &[&seeds[..]];

                let cpi_ctx = CpiContext::new_with_signer( 
                    _ctx.accounts.token_program.to_account_info(),
                    transfer_instruction,
                    signer,
                );
                anchor_spl::token::transfer(cpi_ctx, _amount)?; 
            }
        }
        Ok(())
    }

     // 更新 ido或者 claim状态
     pub fn update_config(ctx: Context<UpdateConfigInfo>, _is_ido: bool, _is_claim: bool) -> Result<()> {
        let admin_key: Pubkey = Pubkey::from_str(DEFAULT_ADMIN_KEY).unwrap();
        require!(admin_key == ctx.accounts.signer.key(),
                ErrorCode::NotOwner); 
        
        ctx.accounts.config.is_ido = _is_ido;
        ctx.accounts.config.is_claim = _is_claim;


        Ok(())
    }

  
    // 管理员转出 usdt token
    pub fn transfer_usdt(_ctx: Context<TransferAccounts>,_amount: u64) -> Result<()> {
        let admin_key: Pubkey = Pubkey::from_str(DEFAULT_ADMIN_KEY).unwrap();
        require!(admin_key == _ctx.accounts.signer.key(),
                ErrorCode::NotOwner); 

        let transfer_instruction = Transfer { 
            from: _ctx.accounts.vault_token_account.to_account_info(),
            to: _ctx.accounts.sender_token_account.to_account_info(),
            authority: _ctx.accounts.token_account_owner_pda.to_account_info(),
        };

        let bump = _ctx.bumps.token_account_owner_pda; 
        let seeds = &[b"token_account_owner_pda".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer( 
            _ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        anchor_spl::token::transfer(cpi_ctx, _amount)?; 
       
        Ok(())
    }

     // 管理员转出 ent token
    pub fn transfer_ent(_ctx: Context<TransferAccounts>,_amount: u64) -> Result<()> {
        let admin_key: Pubkey = Pubkey::from_str(DEFAULT_ADMIN_KEY).unwrap();
        require!(admin_key == _ctx.accounts.signer.key(),
                ErrorCode::NotOwner); 

        let transfer_instruction = Transfer {
            from: _ctx.accounts.vault_token_account.to_account_info(),
            to: _ctx.accounts.sender_token_account.to_account_info(),
            authority: _ctx.accounts.token_account_owner_pda.to_account_info(),
        };

        let bump = _ctx.bumps.token_account_owner_pda; 
        let seeds = &[b"token_account_owner_pda".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            _ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        anchor_spl::token::transfer(cpi_ctx, _amount)?; 
       
        Ok(())
    }

    // 查询配置和用户信息
    pub fn select_info(_ctx: Context<SelectInfo>) -> Result<()> {
        msg!("config PDA: {:?}", _ctx.accounts.config.key());
        msg!("config Bump: {:?}", _ctx.accounts.config.bump);
        msg!("ctx.accounts.config.is_ido: {:?}", _ctx.accounts.config.is_ido);
        msg!("ctx.accounts.config.is_claim: {:?}", _ctx.accounts.config.is_claim);

        msg!("userinfo PDA: {:?}", _ctx.accounts.userinfo.key());
        msg!("userinfo Bump: {:?}", _ctx.accounts.userinfo.bump);
        msg!("user{:?}",_ctx.accounts.userinfo.user);
        msg!("amount{:?}",_ctx.accounts.userinfo.amount);
        Ok(())
    }
}
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(  
        init_if_needed,
        payer = signer,
        seeds=[b"token_account_owner_pda"],
        bump,
        space = 8
    )]
    /// CHECK: This is safe because this account is a PDA derived from a known seed.
    token_account_owner_pda: AccountInfo<'info>,

    #[account(   
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
    token_program: Program<'info, Token>, 
    rent: Sysvar<'info, Rent> 
}


#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    system_program: Program<'info, System>,


    #[account(
        init_if_needed,
        space = 8 + ConfigInfo::INIT_SPACE,
        payer = signer,
        seeds = [
            b"ido_config" 
        ],
        bump
    )]
    pub config: Account<'info, ConfigInfo>,

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
pub struct UpdateConfigInfo<'info> {
    #[account(mut)] 
    signer: Signer<'info>, 
    system_program: Program<'info, System>,
    
    #[account(
        mut,
        seeds = [
            b"ido_config"
        ],
        bump = config.bump
    )]
    pub config: Account<'info, ConfigInfo>
}

#[derive(Accounts)]
pub struct UserIdo<'info> {
    
    #[account(
        mut,
        seeds = [b"user_info_vec"],
        bump = userinfo.bump,
    )]
    userinfo: Account<'info, UserInfoVec>,
    #[account(
        seeds = [
            b"ido_config", 
        ],
        bump = config.bump,
    )]
    pub config: Account<'info, ConfigInfo>,



     // Derived PDAs
     #[account(mut, 
        seeds=[b"token_account_owner_pda"],
        bump
    )]
    /// CHECK: This is safe because this account is a PDA derived from a known seed.
    token_account_owner_pda: AccountInfo<'info>,

    #[account(mut, 
        seeds=[b"token_vault", mint_of_token_being_sent.key().as_ref()],
        bump,
        token::mint=mint_of_token_being_sent,
        token::authority=token_account_owner_pda,
    )]
    vault_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]   
    sender_token_account: Box<Account<'info, TokenAccount>>,
    mint_of_token_being_sent: Box<Account<'info, Mint>>,

    #[account(mut)] 
    signer: Signer<'info>, 
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>, 
}

#[derive(Accounts)]
pub struct UserClaim<'info> {
    #[account(mut)] 
    pub signer: Signer<'info>, 
    pub system_program: Program<'info, System>,
    token_program: Program<'info, Token>, 
    rent: Sysvar<'info, Rent>,

    #[account(
        seeds = [
            b"ido_config", 
        ],
        bump = config.bump,
    )]
    pub config: Account<'info, ConfigInfo>,
    
    #[account(
        mut,
        seeds = [b"user_info_vec"],
        bump = userinfo.bump,
    )]
    pub userinfo: Account<'info, UserInfoVec>,


     // Derived PDAs
     #[account(mut,
        seeds=[b"token_account_owner_pda"],
        bump
    )]
    /// CHECK: This is safe because this account is a PDA derived from a known seed.
    token_account_owner_pda: AccountInfo<'info>,

    #[account(mut, 
        seeds=[b"token_vault", mint_of_token_being_sent.key().as_ref()],
        bump,
        token::mint=mint_of_token_being_sent,
        token::authority=token_account_owner_pda,
    )]
    vault_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]  
    sender_token_account: Box<Account<'info, TokenAccount>>,
    mint_of_token_being_sent: Box<Account<'info, Mint>>,

}


#[derive(Accounts)]
pub struct SelectInfo<'info> {
    #[account(
        seeds = [
            b"ido_config"
        ],
        bump = config.bump
    )]
    pub config: Account<'info, ConfigInfo>,

    #[account(
        seeds = [b"user_info_vec"],
        bump = userinfo.bump,
    )]
    userinfo: Account<'info, UserInfoVec>,

    #[account(mut)] 
    signer: Signer<'info>, 
    system_program: Program<'info, System>
}


#[derive(Accounts)]
pub struct TransferAccounts<'info> {
    #[account(mut,
        seeds=[b"token_account_owner_pda"],
        bump
    )]
    /// CHECK: This is safe because this account is a PDA derived from a known seed.
    token_account_owner_pda: AccountInfo<'info>,

    #[account(mut, 
        seeds=[b"token_vault", mint_of_token_being_sent.key().as_ref()],
        bump,
        token::mint=mint_of_token_being_sent,
        token::authority=token_account_owner_pda,
    )]
    vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]   
    sender_token_account: Account<'info, TokenAccount>,

    mint_of_token_being_sent: Account<'info, Mint>,

    #[account(mut)]
    signer: Signer<'info>,   
    system_program: Program<'info, System>,  
    token_program: Program<'info, Token>, 
    rent: Sysvar<'info, Rent>  
}





#[account] 
#[derive(InitSpace)]
pub struct UserInfoVec {
    #[max_len(200)] 
    pub user: Vec<Pubkey>,  
    #[max_len(200)] 
    pub amount: Vec<u64>,   
    pub bump: u8,
}

#[account] 
#[derive(InitSpace)]
pub struct ConfigInfo {
    pub is_claim: bool, 
    pub is_ido: bool, 
    pub bump: u8 
}

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