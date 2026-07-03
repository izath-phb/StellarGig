#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct StellarGigCounter;

#[contractimpl]
impl StellarGigCounter {
    /// Increments the counter by 1 and returns the new value.
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        count += 1;
        
        // Save the new count
        env.storage().instance().set(&COUNTER, &count);
        
        // Publish an event for the frontend listener
        env.events().publish((symbol_short!("counter"), symbol_short!("increment")), count);
        
        count
    }

    /// Returns the current count.
    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&COUNTER).unwrap_or(0)
    }

    /// Resets the counter to 0.
    pub fn reset(env: Env) {
        env.storage().instance().set(&COUNTER, &0u32);
        
        // Publish a reset event
        env.events().publish((symbol_short!("counter"), symbol_short!("reset")), 0u32);
    }
}
