///! Frame data.
use super::mon::{get_toxtricity_nature, Ability, Gender, IVs, Nature, Shininess};
use super::raid::{AbilityPool, GenderPool, Raid, RollProbability, ShinyPool};
use super::rng::Rng;
use num_traits::FromPrimitive;
use wasm_bindgen::prelude::*;

/// Data for an individual frame of a given raid.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct Frame {
    seed: u64, // TODO: Exposing seed makes wasm-opt fail.
    pub shiny: Shininess,
    pub ivs: IVs,
    pub ability: Ability,
    pub gender: Gender,
    pub nature: Nature,
}

/// Frame generator, taking an initial seed and raid and generating frames.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug)]
pub struct FrameGenerator {
    raid: Raid,
    seed: u64,
    offset: u32,
    rng: Rng,
}

#[wasm_bindgen]
impl FrameGenerator {
    #[wasm_bindgen(constructor)]
    pub fn new(raid: Raid, seed: u64) -> Self {
        FrameGenerator {
            raid,
            seed,
            offset: 0,
            rng: Rng::new(seed),
        }
    }

    /// Resets the seed to compute the next frame.
    fn advance_seed(&mut self, seed: u64) {
        self.rng.reset(seed);
        self.seed = seed;
        self.offset += 1;
    }

    /// Returns the current frame, mutating the RNG state.
    fn get_frame(&mut self) -> Option<Frame> {
        let shiny = self.get_shininess();
        let ivs = self.get_ivs();
        let ability = self.get_ability();
        let gender = self.get_gender();
        let nature = self.get_nature();

        Some(Frame {
            seed: self.seed,
            shiny,
            ivs,
            ability,
            gender,
            nature,
        })
    }

    /// Determines whether the frame is shiny.
    fn get_shininess(&mut self) -> Shininess {
        // EC isn't used here, but we need to bump the RNG.
        let _ = self.rng.next_int(u32::MAX);
        let tidsid = self.rng.next_int(u32::MAX);
        let pid = self.rng.next_int(u32::MAX);

        // Note that unlike RaidFinder, this does NOT calculate the final PID
        // based on the true TID and SID, since we do not have that information.
        // We use the temporary TID and SID to determine shininess. The resulting
        // PID is usually correct for non-shiny mons, but many not be correct
        // for shiny mons.
        match self.raid.get_shiny_pool() {
            ShinyPool::Locked(is_shiny) if !is_shiny => Shininess::None,
            ShinyPool::Locked(_) => match FrameGenerator::get_shiny_value(pid, tidsid) {
                sv if sv >= 16 => Shininess::Square,
                sv if sv == 0 => Shininess::Square,
                _ => Shininess::Star,
            },
            ShinyPool::Random => match FrameGenerator::get_shiny_value(pid, tidsid) {
                sv if sv == 0 => Shininess::Square,
                sv if sv < 16 => Shininess::Star,
                _ => Shininess::None,
            },
        }
    }

    /// Calculates the shiny value (SV) of the mon based on the temporary TID/SID.
    #[inline]
    fn get_shiny_value(pid: u32, tidsid: u32) -> u16 {
        let split_xor = |n: u32| {
            let msbs = n >> 16;
            let lsbs = n & 0xffff;
            msbs as u16 ^ lsbs as u16
        };
        split_xor(pid) ^ split_xor(tidsid)
    }

    /// Calculates IVs, taking into account the number of best IVs from the star count.
    fn get_ivs(&mut self) -> IVs {
        // Set flawless IVs.
        let mut ivs: [Option<u32>; 6] = [None, None, None, None, None, None];
        let mut i = 0;
        while i < self.raid.get_min_flawless_ivs() {
            // Pick an IV, modding by 7 until less than 6.
            let stat = self.rng.next_int_max(6, 0x7) as usize;
            if let None = ivs[stat] {
                ivs[stat] = Some(31);
                i += 1;
            }
        }

        // Set remaining (non-guaranteed-31) IVs.
        for j in 0..6 {
            if let None = ivs[j] {
                // We can use 31 as both the max and the mask, because 31 in binary is 1111.
                ivs[j] = Some(self.rng.next_int(31))
            }
        }

        IVs(
            ivs[0].unwrap(),
            ivs[1].unwrap(),
            ivs[2].unwrap(),
            ivs[3].unwrap(),
            ivs[4].unwrap(),
            ivs[5].unwrap(),
        )
    }

    /// Calculates ability of the frame.
    fn get_ability(&mut self) -> Ability {
        match self.raid.get_ability_pool() {
            AbilityPool::Locked(ability) => ability,
            AbilityPool::Random => match self.rng.next_int_max(3, 0x3) {
                n if n == 0 => Ability::First,
                n if n == 1 => Ability::Second,
                n if n == 2 => Ability::Hidden,
                _ => panic!("Rolled an invalid ability"),
            },
            AbilityPool::NoHA => match self.rng.next_int(1) {
                n if n == 0 => Ability::First,
                n if n == 1 => Ability::Second,
                _ => panic!("Rolled an invalid ability"),
            },
        }
    }

    /// Calculates gender of the frame.
    /// Takes a mon's gender ratio and the gender locking of the den.
    fn get_gender(&mut self) -> Gender {
        match self.raid.get_gender_pool() {
            GenderPool::Locked(gender) => gender,
            GenderPool::Random(gender_ratio) => match gender_ratio {
                ratio if ratio == 255 => Gender::Genderless, // Mon is always genderless.
                ratio if ratio == 254 => Gender::Female,     // Mon is always female.
                ratio if ratio == 0 => Gender::Male,         // Mon is always male.
                // Roll for gender if species isn't locked.
                _ if self.rng.next_int_max(253, 0xff) + 1 < gender_ratio => Gender::Female,
                _ => Gender::Male,
            },
        }
    }

    /// Calculates nature of the frame.
    fn get_nature(&mut self) -> Nature {
        // Handle Toxtricity nature.
        if self.raid.get_species() == 849 {
            get_toxtricity_nature(&mut self.rng, self.raid.get_alt_form() == 0)
        } else {
            let nature = self.rng.next_int_max(25, 0x1f);
            Nature::from_u32(nature).unwrap()
        }
    }
}

impl Iterator for FrameGenerator {
    type Item = Frame;

    fn next(&mut self) -> Option<Self::Item> {
        let result = self.get_frame();
        let next_seed = Rng::get_seed_at_offset(self.seed, 1);
        self.advance_seed(next_seed);
        result
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_single_frame_gender_lock_no_ha() {
        // Den 2, Shield.
        assert_eq!(
            FrameGenerator::new(
                Raid::new(
                    678, // Meowstic.
                    RollProbability(0, 0, 0, 0, 15),
                    3,     // Guaranteed flawless IVs.
                    0,     // Alt form: N/A.
                    false, // Not G-max.
                    3,     // Random ability, no HA.
                    2,     // Gender-locked female.
                    None,  // Gender ratio N/A.
                    0,     // Random shininess.
                ),
                0xc816c270fd1cd8fd
            )
            .next(),
            Some(Frame {
                seed: 0xc816c270fd1cd8fd,
                shiny: Shininess::None,
                ivs: IVs(31, 21, 12, 31, 15, 31),
                nature: Nature::Brave,
                ability: Ability::First,
                gender: Gender::Female,
            })
        );
    }

    #[test]
    fn test_single_frame_random_gender_no_ha() {
        // Den 14, Shield.
        // Random gender.
        assert_eq!(
            FrameGenerator::new(
                Raid::new(
                    439, // Mime Jr.
                    RollProbability(35, 0, 0, 0, 0),
                    1,         // Guaranteed flawless IVs.
                    0,         // Alt form: N/A.
                    false,     // Not G-max.
                    3,         // Random ability, no HA.
                    0,         // Random gender.
                    Some(127), // Gender ratio.
                    0,         // Random shininess.
                ),
                0x4ab973e61fba4358
            )
            .next(),
            Some(Frame {
                seed: 0x4ab973e61fba4358,
                shiny: Shininess::None,
                ivs: IVs(2, 29, 13, 22, 15, 31),
                nature: Nature::Lonely,
                ability: Ability::Second,
                gender: Gender::Female,
            })
        );
    }

    #[test]
    fn test_single_frame_ha_locked() {
        // Den 100.
        // HA-locked.
        assert_eq!(
            FrameGenerator::new(
                Raid::new(
                    40, // Wigglytuff.
                    RollProbability(0, 0, 0, 0, 15),
                    4,         // Guaranteed flawless IVs.
                    0,         // Alt form: N/A.
                    false,     // Not G-max.
                    2,         // HA-locked.
                    0,         // Random gender.
                    Some(191), // Gender ratio.
                    0,         // Random shininess.
                ),
                0x775b846f76f1b25d
            )
            .next(),
            Some(Frame {
                seed: 0x775b846f76f1b25d,
                shiny: Shininess::Star,
                ivs: IVs(31, 1, 31, 31, 30, 31),
                nature: Nature::Adamant,
                ability: Ability::Hidden,
                gender: Gender::Male,
            })
        );
    }

    #[test]
    fn test_multi_frame_ha_locked() {
        // Den 100.
        // HA-locked.
        let f = FrameGenerator::new(
            Raid::new(
                40, // Wigglytuff.
                RollProbability(0, 0, 0, 0, 15),
                4,         // Guaranteed flawless IVs.
                0,         // Alt form: N/A.
                false,     // Not G-max.
                2,         // HA-locked.
                0,         // Random gender.
                Some(191), // Gender ratio.
                0,         // Random shininess.
            ),
            0x775b846f76f1b25d,
        );

        assert_eq!(
            f.take(10).collect::<Vec<Frame>>(),
            vec![
                Frame {
                    seed: 0x775b846f76f1b25d,
                    shiny: Shininess::Star,
                    ivs: IVs(31, 1, 31, 31, 30, 31),
                    nature: Nature::Adamant,
                    ability: Ability::Hidden,
                    gender: Gender::Male
                },
                Frame {
                    seed: 0xf9fe35e4998f1cb8,
                    shiny: Shininess::None,
                    ivs: IVs(31, 31, 31, 31, 14, 8),
                    nature: Nature::Hasty,
                    ability: Ability::Hidden,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0x7ca0e759bc2c8713,
                    shiny: Shininess::None,
                    ivs: IVs(31, 1, 31, 31, 31, 2),
                    nature: Nature::Bashful,
                    ability: Ability::Hidden,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0xff4398cedec9f16e,
                    shiny: Shininess::None,
                    ivs: IVs(11, 31, 27, 31, 31, 31),
                    nature: Nature::Sassy,
                    ability: Ability::Hidden,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0x81e64a4401675bc9,
                    shiny: Shininess::None,
                    ivs: IVs(31, 31, 31, 6, 16, 31),
                    nature: Nature::Calm,
                    ability: Ability::Hidden,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0x488fbb92404c624,
                    shiny: Shininess::None,
                    ivs: IVs(31, 31, 31, 31, 18, 10),
                    nature: Nature::Bold,
                    ability: Ability::Hidden,
                    gender: Gender::Male
                },
                Frame {
                    seed: 0x872bad2e46a2307f,
                    shiny: Shininess::None,
                    ivs: IVs(8, 31, 31, 31, 31, 7),
                    nature: Nature::Gentle,
                    ability: Ability::Hidden,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0x9ce5ea3693f9ada,
                    shiny: Shininess::None,
                    ivs: IVs(31, 30, 18, 31, 31, 31),
                    nature: Nature::Careful,
                    ability: Ability::Hidden,
                    gender: Gender::Male
                },
                Frame {
                    seed: 0x8c7110188bdd0535,
                    shiny: Shininess::None,
                    ivs: IVs(31, 28, 31, 31, 31, 15),
                    nature: Nature::Bashful,
                    ability: Ability::Hidden,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0xf13c18dae7a6f90,
                    shiny: Shininess::None,
                    ivs: IVs(31, 31, 31, 31, 28, 12),
                    nature: Nature::Adamant,
                    ability: Ability::Hidden,
                    gender: Gender::Female
                },
            ]
        );
    }

    #[test]
    fn test_multi_frame_random_gender_no_ha() {
        // Den 14, Shield.
        // Random gender.
        let f = FrameGenerator::new(
            Raid::new(
                439, // Mime Jr.
                RollProbability(35, 0, 0, 0, 0),
                1,         // Guaranteed flawless IVs.
                0,         // Alt form: N/A.
                false,     // Not G-max.
                3,         // Random ability, no HA.
                0,         // Random gender.
                Some(127), // Gender ratio.
                0,         // Random shininess.
            ),
            0x4ab973e61fba4358,
        );

        assert_eq!(
            f.take(10).collect::<Vec<Frame>>(),
            vec![
                Frame {
                    seed: 0x4ab973e61fba4358,
                    shiny: Shininess::None,
                    ivs: IVs(2, 29, 13, 22, 15, 31),
                    nature: Nature::Lonely,
                    ability: Ability::Second,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0xcd5c255b4257adb3,
                    shiny: Shininess::None,
                    ivs: IVs(26, 4, 0, 0, 3, 31),
                    nature: Nature::Serious,
                    ability: Ability::First,
                    gender: Gender::Male
                },
                Frame {
                    seed: 0x4ffed6d064f5180e,
                    shiny: Shininess::None,
                    ivs: IVs(17, 9, 14, 31, 24, 30),
                    nature: Nature::Relaxed,
                    ability: Ability::Second,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0xd2a1884587928269,
                    shiny: Shininess::None,
                    ivs: IVs(9, 15, 31, 26, 7, 29),
                    nature: Nature::Rash,
                    ability: Ability::First,
                    gender: Gender::Male
                },
                Frame {
                    seed: 0x554439baaa2fecc4,
                    shiny: Shininess::None,
                    ivs: IVs(22, 7, 31, 3, 16, 10),
                    nature: Nature::Docile,
                    ability: Ability::First,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0xd7e6eb2fcccd571f,
                    shiny: Shininess::None,
                    ivs: IVs(3, 31, 31, 0, 30, 22),
                    nature: Nature::Relaxed,
                    ability: Ability::First,
                    gender: Gender::Male
                },
                Frame {
                    seed: 0x5a899ca4ef6ac17a,
                    shiny: Shininess::None,
                    ivs: IVs(31, 31, 3, 12, 27, 11),
                    nature: Nature::Quirky,
                    ability: Ability::First,
                    gender: Gender::Male
                },
                Frame {
                    seed: 0xdd2c4e1a12082bd5,
                    shiny: Shininess::None,
                    ivs: IVs(17, 31, 7, 20, 5, 10),
                    nature: Nature::Docile,
                    ability: Ability::First,
                    gender: Gender::Male
                },
                Frame {
                    seed: 0x5fceff8f34a59630,
                    shiny: Shininess::None,
                    ivs: IVs(2, 2, 18, 12, 30, 31),
                    nature: Nature::Lonely,
                    ability: Ability::Second,
                    gender: Gender::Female
                },
                Frame {
                    seed: 0xe271b1045743008b,
                    shiny: Shininess::None,
                    ivs: IVs(12, 31, 26, 30, 26, 11),
                    nature: Nature::Brave,
                    ability: Ability::Second,
                    gender: Gender::Male
                },
            ]
        );
    }
}
