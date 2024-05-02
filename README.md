# Chain-Fi (RebelFi's API backend and on-chain processor)

## Responsibilities
This repo has multiple purposes:

- serve as the API backend for RebelFi's mobile (app-fi) and web app (main-fi)
- handle all backend chain activities including:
  - chain syncing (sync accounts with chain)
  - automations (auto-deposit to lending protocols)
  - action handling (payments/transfers)

## Modules / Architecture
This repo is a monorepo that contains multiple modules, which generally all work together but which may be also be used 
independently.

**Modules**
- **api** - the API backend for RebelFi's mobile (app-fi) and web app (main-fi)
- **common** - common code shared between modules. holds config-related code + bugtracking and various utils 
- **analytics** - analytics module for tracking user activity (mixpanel)
- **db** - database entity definitions and daos (mikro-orm)
- **email** - email service + templates
- **jobs** - background jobs (cron)
- **solana** - solana client and program interfaces

Database entities are stored in db/models. A subset of these entities are also mapped in brain-fi via sqlalchemy, but
the list here is the single source of truth and what's used for db updates/migrations/etc...

## Overview
Userfront is currently being used for authentication/authorization, until we migrate to something like Web3Auth or just 
roll our own.

Wallets are stored in the database and we're using a custodial framework for now. Eventually we'll move to using a smart 
account system and on-chain programs to minimize custodial risk and to move to a trustless system. 

Current lending program we're using for yield is Solend. We'll probably move to something like Meteora to optimize yield.

### Actions
Actions are the main way that users interact with the system. When the user confirms an action (e.g. a payment), the 
system does the necessary checks and creates an action in the database. The action then gets picked up by the action 
processing job, which will then execute the action on-chain. Thus, actions are an asynchronous mechanism, but get processed
rapidly (within a few seconds).

### Syncing
User token accounts for stables (i.e. USDC) are constantly monitored for deposits. When deposits are detected (and are not 
associated with an known action), the system automatically moves the deposit into the lending protocol. Similarly, when 
users make transfers, the amount is first removed from the lending protocol before being sent to the intended destination.
