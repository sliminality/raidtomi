//! Random number generator.
//! Based on the [xoroshiro128+](http://prng.di.unimi.it/xoroshiro128plus.c) RNG.
use wasm_bindgen::prelude::*;

use std::num::Wrapping as w;

/// Keeps track of the state.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug)]
pub struct Rng(u64, u64);

/// Second half of the initial state is always this constant.
pub static MAGIC_SEED: u64 = 0x82a2b175229d6a5b;

/// Left rotation.
#[inline]
fn rotl(x: u64, k: u8) -> u64 {
    (x << k) | (x >> (64 - k))
}

/// Returns an integer mask for the given number.
/// The mask is m = 2^k - 1 for the smallest k such that m >= n, the given number.
/// Thanks to AdmiralFish's RaidFinder for this logic.
macro_rules! mask {
    ($n:expr) => {{
        let mut m = $n - 1;
        m |= m >> 1;
        m |= m >> 2;
        m |= m >> 4;
        m |= m >> 8;
        m |= m >> 16;
        m
    }};
}

impl Rng {
    /// Creates a new RNG instance with the given seed.
    pub fn new(seed: u64) -> Self {
        Rng(seed, MAGIC_SEED)
    }

    /// Creates a new RNG instance with the given full state.
    pub fn from_state(s0: u64, s1: u64) -> Self {
        Rng(s0, s1)
    }

    /// Reset generator with a new seed.
    pub fn reset(&mut self, seed: u64) {
        self.0 = seed;
        self.1 = MAGIC_SEED;
    }

    /// Reset generator with a new full state.
    pub fn reset_state(&mut self, s0: u64, s1: u64) {
        self.0 = s0;
        self.1 = s1;
    }

    /// Returns a random 32-bit value less than the desired maximum.
    /// At each iteration, if the value is greater than the max, we mod it by the smallest power of 2 greater than the number.
    #[inline]
    pub fn next_int_max(&mut self, max: u32) -> u32 {
        // Compute the bit mask for the next largest power of 2.
        let mask = mask!(max);
        let mut result = self.next_int(mask);
        while result >= max {
            // Mod the result by the mask until the result is small enough.
            result = self.next_int(mask);
        }
        result
    }

    /// Returns a random 32-bit value, masked.
    #[inline]
    pub fn next_int(&mut self, mask: u32) -> u32 {
        self.next() as u32 & mask
    }

    /// Advance the RNG according to the current state.
    #[inline]
    pub fn next(&mut self) -> u64 {
        let s0 = w(self.0);
        let mut s1 = w(self.1);
        let result = s0 + s1;

        s1 ^= s0;
        self.0 = (w(rotl(s0.0, 24)) ^ s1 ^ (s1 << 16)).0;
        self.1 = rotl(s1.0, 37);

        result.0
    }

    /// Returns the seed `i` frames ahead of the given seed.
    pub fn get_seed_at_offset(seed: u64, index: usize) -> u64 {
        (w(seed) + w(MAGIC_SEED) * w(index as u64)).0
    }

    /// Returns the current state of the RNG.
    pub fn get_state(&self) -> (u64, u64) {
        (self.0, self.1)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Test generation of 64-bit integers.
    #[test]
    fn test_next_stateless() {
        assert_eq!(Rng::new(0).next(), 9413281287807789659);
        assert_eq!(Rng::new(0x2b4610ec42f20b13).next(), 12531479686729921902);
    }

    /// Test that internal state is mutated correctly.
    #[test]
    fn test_next_stateful() {
        let mut rng = Rng::new(0x2b4610ec42f20b13);
        assert_eq!(rng.next(), 12531479686729921902);
        assert_eq!(rng.next(), 0xf22b5d124ea05a84);
    }

    /// Test that operations handle overflow.
    #[test]
    fn test_next_overflow() {
        assert_eq!(Rng::new(0xc816c270fd1cd8fd).next(), 5384462261710111576);
    }

    /// Test mask generation.
    #[test]
    fn test_mask() {
        assert_eq!(mask!(253), 0xFF);
        assert_eq!(mask!(25), 0x1F);
        assert_eq!(mask!(6), 0x7);
        assert_eq!(mask!(3), 0x3);
        assert_eq!(mask!(12), 15);
        assert_eq!(mask!(13), 15);
        assert_eq!(mask!(100), 0x7F);
    }

    /// Test masking.
    #[test]
    fn test_next_int() {
        // Masking with all zeros nulls out the answer.
        let mut rng = Rng::new(0xc816c270fd1cd8fd);
        assert_eq!(rng.next_int(0), 0);

        // Masking with all ones is equivalent to unmasked.
        rng.reset(0xc816c270fd1cd8fd);
        assert_eq!(
            rng.next_int(0xffffffff),
            Rng::new(0xc816c270fd1cd8fd).next() as u32
        );

        // Masking by a smaller value returns a smaller value.
        rng.reset(0xc816c270fd1cd8fd);
        assert_eq!(rng.next_int(0xffff), 17240);
    }

    /// Test max value with mask.
    #[test]
    fn test_next_int_max() {
        let seed = 0x973bb011937bc1a8;
        let mut rng = Rng::new(seed);
        assert_eq!(rng.next_int_max(6), 3);
        rng.reset(seed);
        assert_eq!(rng.next_int_max(8192) <= 8192, true);
    }

    #[test]
    fn test_get_seed_at_offset() {
        let seed = 0x973bb011937bc1a8;
        assert_eq!(Rng::get_seed_at_offset(seed, 0), seed);
        assert_eq!(
            Rng::get_seed_at_offset(seed, 1),
            (w(seed) + w(MAGIC_SEED)).0
        );
        assert_eq!(
            Rng::get_seed_at_offset(seed, 10_000_000),
            0x9a1b9a62448a4128
        );
    }
}
