///! Frame data.
use super::filter::{Filter, FrameFilter};
use super::mon::{get_toxtricity_nature, Ability, Gender, IVs, Nature, Shininess};
use super::raid::{AbilityPool, GenderPool, Raid, ShinyPool};
use super::rng::Rng;
use num_traits::FromPrimitive;
use wasm_bindgen::prelude::*;

/// We can't expose a u64 to JavaScript, so break the seed into two u32s.
#[wasm_bindgen]
pub struct Seed(pub u32, pub u32);

#[wasm_bindgen]
impl Seed {
    pub fn from_u64(n: u64) -> Self {
        let msbs = n >> 32;
        let lsbs = n & 0xffff_ffff;
        Seed(msbs as u32, lsbs as u32)
    }
}

/// Data for an individual frame of a given raid.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct Frame {
    seed: u64, // TODO: Exposing seed makes wasm-opt fail.
    pub shiny: Shininess,
    pub ivs: IVs,
    pub ability: Ability,
    pub gender: Gender,
    pub nature: Nature,
}

#[wasm_bindgen]
impl Frame {
    pub fn get_seed(&self) -> Seed {
        Seed::from_u64(self.seed)
    }
}

/// Describes the result of stepping one frame.
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum FrameResult {
    Fail,
    Pass(Frame),
}

impl FrameResult {
    /// Returns Some(Frame) if the result passed, and None otherwise.
    pub fn to_option(self) -> Option<Frame> {
        if let Self::Pass(f) = self {
            Some(f)
        } else {
            None
        }
    }

    /// Returns true if the result passed, and false otherwise.
    pub fn is_pass(&self) -> bool {
        if let &Self::Pass(_) = self {
            true
        } else {
            false
        }
    }
}

/// Frame generator, taking an initial seed and raid and generating frames.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug)]
pub struct FrameGenerator {
    raid: Raid,
    filter: Option<FrameFilter>,
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
            filter: None,
            seed,
            offset: 0,
            rng: Rng::new(seed),
        }
    }

    /// Resets the seed to compute the next frame.
    fn advance_seed(&mut self) {
        let seed = Rng::get_seed_at_offset(self.seed, 1);
        self.rng.reset(seed);
        self.seed = seed;
        self.offset += 1;
    }

    /// Sets a filter to be applied to subsequent iterations.
    pub fn set_filter(&mut self, filter: FrameFilter) {
        self.filter = Some(filter);
    }

    /// Returns the current frame, mutating the RNG state, and checking if it passes a filter.
    fn get_frame_filtered(&mut self, filter: &FrameFilter) -> FrameResult {
        let shiny = self.get_shininess();
        if let Some(f) = filter.shiny {
            if !f.test(&shiny) {
                return FrameResult::Fail;
            }
        }
        let ivs = FrameGenerator::get_ivs(&mut self.rng, self.raid.get_min_flawless_ivs());
        if let Some(f) = filter.ivs {
            if !f.test(&ivs) {
                return FrameResult::Fail;
            }
        }
        let ability = self.get_ability();
        if let Some(f) = filter.ability {
            if !f.test(&ability) {
                return FrameResult::Fail;
            }
        }
        let gender = self.get_gender();
        if let Some(f) = filter.gender {
            if !f.test(&gender) {
                return FrameResult::Fail;
            }
        }
        let nature = self.get_nature();
        if let Some(f) = filter.nature {
            if !f.test(&nature) {
                return FrameResult::Fail;
            }
        }

        FrameResult::Pass(Frame {
            seed: self.seed,
            shiny,
            ivs,
            ability,
            gender,
            nature,
        })
    }

    /// Returns the current frame, mutating the RNG state.
    fn get_frame(&mut self) -> FrameResult {
        let shiny = self.get_shininess();
        let ivs = FrameGenerator::get_ivs(&mut self.rng, self.raid.get_min_flawless_ivs());
        let ability = self.get_ability();
        let gender = self.get_gender();
        let nature = self.get_nature();

        FrameResult::Pass(Frame {
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
            ShinyPool::Locked(false) => Shininess::None,
            ShinyPool::Locked(true) => match FrameGenerator::get_shiny_value(pid, tidsid) {
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
    pub fn get_shiny_value(pid: u32, tidsid: u32) -> u16 {
        let split_xor = |n: u32| {
            let msbs = n >> 16;
            let lsbs = n & 0xffff;
            msbs as u16 ^ lsbs as u16
        };
        split_xor(pid) ^ split_xor(tidsid)
    }

    /// Calculates IVs, taking into account the number of best IVs from the star count.
    pub fn get_ivs(rng: &mut Rng, min_flawless_ivs: u8) -> IVs {
        // Set flawless IVs.
        let mut ivs: [Option<u32>; 6] = [None, None, None, None, None, None];
        let mut i = 0;
        while i < min_flawless_ivs {
            // Pick an IV, modding by 7 until less than 6.
            let stat = rng.next_int_max(6) as usize;
            if let None = ivs[stat] {
                ivs[stat] = Some(31);
                i += 1;
            }
        }

        // Set remaining (non-guaranteed-31) IVs.
        for j in 0..6 {
            if let None = ivs[j] {
                // We can use 31 as both the max and the mask, because 31 in binary is 1111.
                ivs[j] = Some(rng.next_int(31))
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
            AbilityPool::Random => match self.rng.next_int_max(3) {
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
                _ if self.rng.next_int_max(253) + 1 < gender_ratio as u32 => Gender::Female,
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
            let nature = self.rng.next_int_max(25);
            Nature::from_u32(nature).unwrap()
        }
    }
}

impl Iterator for FrameGenerator {
    type Item = FrameResult;

    /// Generates frames endlessly.
    fn next(&mut self) -> Option<Self::Item> {
        let result = if let Some(filter) = self.filter {
            self.get_frame_filtered(&filter)
        } else {
            self.get_frame()
        };
        self.advance_seed();
        Some(result)
    }
}

#[cfg(test)]
mod test {
    use super::super::filter::{IVJudgment, NatureFilter, ShinyFilter, SingleIVFilter};
    use super::*;

    #[test]
    fn test_single_frame_gender_lock_no_ha() {
        // Den 2, Shield.
        assert_eq!(
            FrameGenerator::new(
                Raid::new(
                    678,   // Meowstic.
                    0,     // Alt form: N/A.
                    3,     // Guaranteed flawless IVs.
                    false, // Not G-max.
                    3,     // Random ability, no HA.
                    2,     // Gender-locked female.
                ),
                0xc816c270fd1cd8fd
            )
            .next(),
            Some(FrameResult::Pass(Frame {
                seed: 0xc816c270fd1cd8fd,
                shiny: Shininess::None,
                ivs: IVs(31, 21, 12, 31, 15, 31),
                nature: Nature::Brave,
                ability: Ability::First,
                gender: Gender::Female,
            }))
        );
    }

    #[test]
    fn test_single_frame_random_gender_no_ha() {
        // Den 14, Shield.
        // Random gender.
        assert_eq!(
            FrameGenerator::new(
                Raid::new(
                    439,   // Mime Jr.
                    0,     // Alt form: N/A.
                    1,     // Guaranteed flawless IVs.
                    false, // Not G-max.
                    3,     // Random ability, no HA.
                    0,     // Random gender.
                ),
                0x4ab973e61fba4358
            )
            .next(),
            Some(FrameResult::Pass(Frame {
                seed: 0x4ab973e61fba4358,
                shiny: Shininess::None,
                ivs: IVs(2, 29, 13, 22, 15, 31),
                nature: Nature::Lonely,
                ability: Ability::Second,
                gender: Gender::Female,
            }))
        );
    }

    #[test]
    fn test_single_frame_ha_locked() {
        // Den 100.
        // HA-locked.
        assert_eq!(
            FrameGenerator::new(
                Raid::new(
                    40,    // Wigglytuff.
                    0,     // Alt form: N/A.
                    4,     // Guaranteed flawless IVs.
                    false, // Not G-max.
                    2,     // HA-locked.
                    0,     // Random gender.
                ),
                0x775b846f76f1b25d
            )
            .next(),
            Some(FrameResult::Pass(Frame {
                seed: 0x775b846f76f1b25d,
                shiny: Shininess::Star,
                ivs: IVs(31, 1, 31, 31, 30, 31),
                nature: Nature::Adamant,
                ability: Ability::Hidden,
                gender: Gender::Male,
            }))
        );
    }

    #[test]
    fn test_multi_frame_ha_locked() {
        // Den 100.
        // HA-locked.
        let f = FrameGenerator::new(
            Raid::new(
                40,    // Wigglytuff.
                0,     // Alt form: N/A.
                4,     // Guaranteed flawless IVs.
                false, // Not G-max.
                2,     // HA-locked.
                0,     // Random gender.
            ),
            0x775b846f76f1b25d,
        );

        assert_eq!(
            f.take(10)
                .filter_map(FrameResult::to_option)
                .collect::<Vec<Frame>>(),
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
                439,   // Mime Jr.
                0,     // Alt form: N/A.
                1,     // Guaranteed flawless IVs.
                false, // Not G-max.
                3,     // Random ability, no HA.
                0,     // Random gender.
            ),
            0x4ab973e61fba4358,
        );

        assert_eq!(
            f.take(10)
                .filter_map(FrameResult::to_option)
                .collect::<Vec<Frame>>(),
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

    #[test]
    fn test_filtered_multi_frame_random_gender_no_ha() {
        // Den 14, Shield.
        // Random gender.
        let mut f = FrameGenerator::new(
            Raid::new(
                439,   // Mime Jr.
                0,     // Alt form: N/A.
                1,     // Guaranteed flawless IVs.
                false, // Not G-max.
                3,     // Random ability, no HA.
                0,     // Random gender.
            ),
            0x4ab973e61fba4358,
        );

        let filter = FrameFilter::new().set_ivs(
            None,
            None,
            None,
            None,
            None,
            Some(SingleIVFilter::new_at_least(IVJudgment::Best)),
        );

        f.set_filter(filter);

        assert_eq!(
            f.take(10)
                .filter_map(FrameResult::to_option)
                .collect::<Vec<Frame>>(),
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
                    seed: 0x5fceff8f34a59630,
                    shiny: Shininess::None,
                    ivs: IVs(2, 2, 18, 12, 30, 31),
                    nature: Nature::Lonely,
                    ability: Ability::Second,
                    gender: Gender::Female
                },
            ]
        );
    }

    #[test]
    fn test_search() {
        // Excadrill.
        let mut f = FrameGenerator::new(
            Raid::new(
                530,   // Excadrill.
                0,     // Alt form: N/A.
                4,     // Guaranteed flawless IVs.
                false, // Not G-max.
                4,     // Random ability, HA possible.
                0,     // Random gender.
            ),
            0xc816c270fd1cd8fd,
        );

        let filter = FrameFilter::new()
            .set_ivs(
                None,
                Some(SingleIVFilter::new_at_most(IVJudgment::NoGood)),
                None,
                None,
                None,
                None,
            )
            .set_shiny(ShinyFilter::Square)
            .set_nature(NatureFilter::from_natures(vec![
                Nature::Hardy,
                Nature::Careful,
            ]));

        f.set_filter(filter);

        assert_eq!(
            f.find(FrameResult::is_pass)
                .map(FrameResult::to_option)
                .flatten(),
            Some(Frame {
                seed: 0x88a8f2e0e6cc5931,
                shiny: Shininess::Square,
                ivs: IVs(31, 0, 9, 31, 31, 31),
                nature: Nature::Careful,
                ability: Ability::Second,
                gender: Gender::Male
            })
        );
    }

    #[test]
    // Negative example of filtering out a result.
    fn test_search_negative() {
        // Excadrill.
        let mut f = FrameGenerator::new(
            Raid::new(
                530,   // Excadrill.
                0,     // Alt form: N/A.
                4,     // Guaranteed flawless IVs.
                false, // Not G-max.
                4,     // Random ability, HA possible.
                0,     // Random gender.
            ),
            0xc816c270fd1cd8fd,
        );

        let filter = FrameFilter::new()
            .set_ivs(
                None,
                Some(SingleIVFilter::new_at_most(IVJudgment::NoGood)),
                None,
                None,
                None,
                None,
            )
            .set_shiny(ShinyFilter::Square)
            .set_nature(NatureFilter::from_natures(vec![Nature::Hardy]));

        f.set_filter(filter);

        assert_eq!(
            f.take(100_000)
                .find(FrameResult::is_pass)
                .map(FrameResult::to_option)
                .flatten(),
            None
        );
    }
}
