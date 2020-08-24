//! Random number generator.
//! Based on the [xoroshiro128+](http://prng.di.unimi.it/xoroshiro128plus.c) RNG.

use std::num::Wrapping as w;

/// Keeps track of the state.
#[derive(PartialEq, Eq, Debug)]
pub struct Rng([u64; 2]);

/// Second half of the initial state is always this constant.
pub static MAGIC_SEED: u64 = 0x82a2b175229d6a5b;

impl Rng {
    /// Creates a new RNG instance with the given seed.
    pub fn new(seed: u64) -> Self {
        Rng([seed, MAGIC_SEED])
    }

    /// Reset generator with a new seed.
    pub fn reset(&mut self, seed: u64) {
        self.0 = [seed, MAGIC_SEED]
    }

    /// Returns a random 64-bit value, masked, less than the desired maximum.
    pub fn next_int_max(&mut self, max: u32, mask: u32) -> u32 {
        // Mod the result by the mask until the result is small enough.
        let mut result = self.next_int(mask);
        while result >= max {
            result = self.next_int(mask);
        }
        result
    }

    /// Returns a random 32-bit value, masked.
    pub fn next_int(&mut self, mask: u32) -> u32 {
        Rng::next(&mut self.0) as u32 & mask
    }

    /// Advance the RNG according to the current state.
    fn next(s: &mut [u64; 2]) -> u64 {
        let s0 = w(s[0]);
        let mut s1 = w(s[1]);
        let result = s0 + s1;

        s1 ^= s0;
        s[0] = (w(s0.0.rotate_left(24)) ^ s1 ^ (s1 << 16)).0;
        s[1] = s1.0.rotate_left(37);

        result.0
    }

    /// Returns the seed `i` frames ahead of the given seed.
    pub fn get_seed_at_offset(seed: u64, index: usize) -> u64 {
        (w(seed) + w(MAGIC_SEED) * w(index as u64)).0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Test generation of 64-bit integers.
    #[test]
    fn test_next() {
        assert_eq!(Rng::next(&mut [0, MAGIC_SEED]), 9413281287807789659);
        assert_eq!(
            Rng::next(&mut [0x2b4610ec42f20b13, MAGIC_SEED]),
            12531479686729921902
        );
    }

    /// Test that operations handle overflow.
    #[test]
    fn test_next_overflow() {
        assert_eq!(
            Rng::next(&mut [0xc816c270fd1cd8fd, MAGIC_SEED]),
            5384462261710111576
        );
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
            Rng::next(&mut [0xc816c270fd1cd8fd, MAGIC_SEED]) as u32
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
        assert_eq!(rng.next_int_max(6, 0x7), 3);
        rng.reset(seed);
        assert_eq!(rng.next_int_max(6, 0x1), 1);
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
