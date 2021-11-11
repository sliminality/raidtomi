///! Generates data for overworld spawns.
///! Thanks to Lincoln-LM for the original approach.
///! https://github.com/Lincoln-LM/PyNXReader/blob/master/rng/G8RNG.py#L547
use super::frame::FrameGenerator;
use super::mon::{Ability, IVs, Mark, Nature, PersonalityMark};
use super::rng::Rng;
use num_traits::FromPrimitive;
use std::fmt;
use wasm_bindgen::prelude::*;

/// Information about the player.
#[derive(PartialEq, Eq, Debug)]
pub struct Player {
    tid: u16,
    sid: u16,
    has_shiny_charm: bool,
    has_mark_charm: bool,
}

/// Min and max level range, inclusive.
#[derive(PartialEq, Eq, Debug, Clone, Copy)]
pub struct Level {
    min: u32,
    max: u32,
}

/// Method of encounter.
#[derive(PartialEq, Eq, Debug, Clone, Copy)]
#[allow(dead_code)]
pub enum EncounterMethod {
    Static,
    Fishing {
        level: Level,
        /// Whether the first and second held item slots are different.
        diff_held_item: bool,
    },
    /// Overworld or grass encounters.
    Overworld {
        level: Level,
        /// Whether the first and second held item slots are different.
        diff_held_item: bool,
    },
}

impl EncounterMethod {
    pub fn is_fishing(&self) -> bool {
        match self {
            Self::Fishing { .. } => true,
            _ => false,
        }
    }
}

/// A spawn at a particular advance.
#[derive(PartialEq, Eq, Debug)]
pub struct Spawn {
    advance: u64,
    full_seed: (u64, u64),
    spawn: SpawnType,
    dynamic: DynamicStats,
    mark: Option<Mark>,
}

impl fmt::Display for Spawn {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Spawn {
                spawn: SpawnType::Static,
                ..
            } => write!(
                f,
                "{}  {:x}  {:x}\t{}",
                self.advance, self.full_seed.0, self.full_seed.1, self.dynamic,
            )
            .and_then(|_| {
                if let Some(m) = &self.mark {
                    write!(f, "\t{}", m)
                } else {
                    write!(f, "-")
                }
            }),

            Spawn {
                spawn:
                    SpawnType::Random {
                        slot,
                        level,
                        brilliant,
                    },
                ..
            } => write!(
                f,
                "{}  {:x}  {:x}\t{} {} {}\t{}",
                self.advance,
                self.full_seed.0,
                self.full_seed.1,
                slot,
                level,
                brilliant,
                self.dynamic,
            )
            .and_then(|_| {
                if let Some(m) = &self.mark {
                    write!(f, "\t{}", m)
                } else {
                    write!(f, "-")
                }
            }),
        }
    }
}

#[derive(PartialEq, Eq, Debug)]
enum SpawnType {
    Static,
    Random {
        /// Brilliant aura.
        brilliant: u32,
        /// Encounter slot.
        slot: u32,
        level: u32,
    },
}

#[derive(PartialEq, Eq, Debug)]
struct DynamicStats {
    ec: u32,
    pid: u32,
    nature: Nature,
    ability: Ability,
    ivs: IVs,
    fixed_seed: u32,
}

impl fmt::Display for DynamicStats {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}\t{}  {}", self.nature, self.ability, self.ivs)
    }
}

/// Overworld state machine, taking an initial seed and generating frames.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug)]
pub struct OverworldState {
    player: Player,
    /// Whether there is active weather in the area.
    has_weather: bool,
    encounter: EncounterMethod,
    rng: Rng,
    /// Starting seed of the current frame.
    seed: (u64, u64),
    /// Number of advances made in the RNG.
    advances: u64,
}

impl Iterator for OverworldState {
    type Item = Spawn;

    fn next(&mut self) -> Option<Self::Item> {
        let result = self.get_current_spawn();
        self.advance();
        Some(result)
    }
}

impl OverworldState {
    /// Create a new overworld state.
    pub fn new(
        player: Player,
        has_weather: bool,
        seed: (u64, u64),
        encounter: EncounterMethod,
    ) -> Self {
        Self {
            player,
            has_weather,
            encounter,
            rng: Rng::from_state(seed.0, seed.1),
            seed,
            advances: 0,
        }
    }

    /// Compute the spawn for the given advance.
    pub fn get_current_spawn(&mut self) -> Spawn {
        // Save the RNG state at the start of the frame.
        // We'll reset it at the end, in order to calculate the next advance.
        let full_seed = self.rng.get_state();
        self.seed = full_seed;

        // For a static spawn, no need to compute the species slot, level, mark, or brilliance.
        let encounter = self.encounter.clone();
        let spawn = match encounter {
            EncounterMethod::Static => {
                self.rng.next_int_max(100);
                let dynamic = self.get_current_spawn_helper();

                // If it's a static encounter, this is where we roll the mark.
                let mark = self.get_mark();

                Spawn {
                    advance: self.advances,
                    full_seed,
                    spawn: SpawnType::Static,
                    mark,
                    dynamic,
                }
            }
            EncounterMethod::Fishing { ref level, .. }
            | EncounterMethod::Overworld { ref level, .. } => {
                // Need to make a few throwaway calls to advance the state. Encounter slots?
                self.rng.next_int(u32::MAX);
                self.rng.next_int_max(100);
                self.rng.next_int_max(100);

                // Generate the species encounter slot and stats.
                let slot = self.rng.next_int_max(100);
                let level = self.get_level(level);
                let mark = self.get_mark();
                let brilliant = self.rng.next_int_max(1000);

                let dynamic = self.get_current_spawn_helper();

                Spawn {
                    advance: self.advances,
                    full_seed,
                    spawn: SpawnType::Random {
                        brilliant,
                        slot,
                        level,
                    },
                    mark,
                    dynamic,
                }
            }
        };

        spawn
    }

    /// Reset the RNG to the state at the start of the current advance, then advance once.
    /// Behaves as if we hadn't spawned the mon during this frame, and just advanced to the next frame.
    fn advance(&mut self) {
        self.rng.reset_state(self.seed.0, self.seed.1);
        self.rng.next();
        self.seed = self.rng.get_state();
        self.advances += 1;
    }

    /// Logic used for calculating the stats of the current advance, common across static and non-static spawns.
    fn get_current_spawn_helper(&mut self) -> DynamicStats {
        // Compute shiny, used for calculating fixed values.
        let is_shiny = self.get_shiny();
        self.rng.next_int_max(2); // Love to cargo cult.

        let nature = self.get_nature();
        let ability = self.get_ability();

        // If we need to roll for the held item, account for that in the RNG state.
        match self.encounter {
            EncounterMethod::Fishing { diff_held_item, .. }
            | EncounterMethod::Overworld { diff_held_item, .. } => {
                if diff_held_item {
                    self.rng.next_int_max(100);
                }
            }
            _ => {}
        }

        // Compute the fixed seed.
        let fixed_seed = self.rng.next_int(u32::MAX);
        let (ec, pid, ivs) = self.calculate_fixed(fixed_seed, is_shiny, 0);

        // TODO(slim): Compute XOR here.
        // xor < 16 star
        // xor == 0 square

        DynamicStats {
            ec,
            pid,
            ivs,
            nature,
            ability,
            fixed_seed,
        }
    }

    /// Compute the level for the spawn.
    fn get_level(&mut self, level: &Level) -> u32 {
        if level.min == level.max {
            level.min
        } else {
            level.min + self.rng.next_int_max(level.max - level.min + 1)
        }
    }

    /// Compute the mark for the spawn, if any.
    fn get_mark(&mut self) -> Option<Mark> {
        // If the user has the Mark Charm, roll three times instead of once.
        let iters = if self.player.has_mark_charm { 3 } else { 1 };

        for _ in 0..iters {
            let rare = self.rng.next_int_max(1000);
            let personality = self.rng.next_int_max(100);
            let uncommon = self.rng.next_int_max(50);
            let weather = self.rng.next_int_max(50);
            let time = self.rng.next_int_max(50);
            let fishing = self.rng.next_int_max(25);

            if rare == 0 {
                return Some(Mark::Rare);
            } else if personality == 0 {
                let mark = self.rng.next_int_max(27); // Number of personality marks.
                return PersonalityMark::from_u32(mark).map(Mark::Personality);
            } else if uncommon == 0 {
                return Some(Mark::Uncommon);
            } else if weather == 0 && self.has_weather {
                return Some(Mark::Weather);
            } else if time == 0 {
                return Some(Mark::Time);
            } else if fishing == 0 && self.encounter.is_fishing() {
                return Some(Mark::Fishing);
            }
        }

        return None;
    }

    fn get_shiny(&mut self) -> bool {
        // Concatenate tid and sid.
        let tidsid = ((self.player.sid as u32) << 16) | self.player.tid as u32;
        // If the user has the Shiny Charm, roll three times instead of once.
        let iters = if self.player.has_shiny_charm { 3 } else { 1 };

        for _ in 0..iters {
            let mock_pid = self.rng.next_int(u32::MAX);
            let sv = FrameGenerator::get_shiny_value(mock_pid, tidsid);
            if sv < 16 {
                return true;
            }
        }
        false
    }

    fn get_nature(&mut self) -> Nature {
        Nature::from_u32(self.rng.next_int_max(25)).unwrap()
    }

    fn get_ability(&mut self) -> Ability {
        if self.rng.next_int_max(2) == 1 {
            Ability::First
        } else {
            Ability::Second
        }
    }

    fn calculate_fixed(
        &self,
        fixed_seed: u32,
        is_shiny: bool,
        min_flawless_ivs: u8,
    ) -> (u32, u32, IVs) {
        // Why is the fixed_seed only 32 bits?
        let mut rng = Rng::new(fixed_seed as u64);
        let ec = rng.next_int(u32::MAX);
        let mut pid = rng.next_int(u32::MAX);
        let tidsid = ((self.player.tid as u32) << 16) | self.player.sid as u32;
        let sv = FrameGenerator::get_shiny_value(pid, tidsid);

        // Fix the PID to reflect the actual shininess.
        // TODO(slim): Double-check this logic.
        // Encounter not shiny, but the PID is.
        if !is_shiny && sv < 16 {
            // Make PID unshiny.
            pid ^= 0x10000000;
        } else if is_shiny && sv >= 16 {
            // Encounter is shiny, but the PID isn't.
            // Force the PID to be square.
            let lsbs = pid & 0xFFFF;
            let tsv = self.player.tid ^ self.player.sid;
            pid = ((tsv as u32 ^ lsbs) << 16) | lsbs;
        }

        let ivs = FrameGenerator::get_ivs(&mut rng, min_flawless_ivs);

        (ec, pid, ivs)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use num_traits::FromPrimitive;

    #[test]
    /// Helper function for quickly dumping the next few advances.
    fn print_advances() {
        let state = OverworldState::new(
            Player {
                tid: 57649,
                sid: 60914,
                has_shiny_charm: true,
                has_mark_charm: true,
            },
            true,
            (0x5e5c928d61792fed, 0xed608999e1410aa9),
            EncounterMethod::Static,
        );

        for spawn in state.take(10) {
            println!("{}", spawn);
        }
    }

    #[test]
    fn test_static_encounter() {
        let state = OverworldState::new(
            Player {
                tid: 57649,
                sid: 60914,
                has_shiny_charm: true,
                has_mark_charm: true,
            },
            true,                                     // has_weather
            (0x5e5c928d61792fed, 0xed608999e1410aa9), // seed
            EncounterMethod::Static,
        );

        assert_eq!(
            state.take(10).collect::<Vec<_>>(),
            [
                Spawn {
                    advance: 0,
                    spawn: SpawnType::Static,
                    full_seed: (0x5e5c928d61792fed, 0xed608999e1410aa9),
                    dynamic: DynamicStats {
                        ec: 0xb4421f74,
                        pid: 0xc9d20df8,
                        fixed_seed: 0x91a4b519,
                        nature: Nature::from_u32(13).unwrap(),
                        ability: Ability::Second,
                        ivs: IVs(22, 5, 25, 8, 5, 11)
                    },
                    mark: Some(Mark::Uncommon)
                },
                Spawn {
                    advance: 1,
                    spawn: SpawnType::Static,
                    full_seed: (0x2549e203482279d6, 0x704a89667836290),
                    dynamic: DynamicStats {
                        ec: 0x24008bd9,
                        pid: 0x6b3179c9,
                        fixed_seed: 0x163217e,
                        nature: Nature::from_u32(21).unwrap(),
                        ability: Ability::First,
                        ivs: IVs(24, 4, 28, 17, 23, 8)
                    },
                    mark: Some(Mark::Uncommon)
                },
                Spawn {
                    advance: 2,
                    spawn: SpawnType::Static,
                    full_seed: (0x6b90474de2c252a4, 0xf42368c449a952a5),
                    dynamic: DynamicStats {
                        ec: 0x24008bd9,
                        pid: 0x6b3179c9,
                        fixed_seed: 0x163217e,
                        nature: Nature::from_u32(21).unwrap(),
                        ability: Ability::First,
                        ivs: IVs(24, 4, 28, 17, 23, 8)
                    },
                    mark: Some(Mark::Uncommon)
                },
                Spawn {
                    advance: 3,
                    spawn: SpawnType::Static,
                    full_seed: (0xfdd846b00f019046, 0x6d600033f665f135),
                    dynamic: DynamicStats {
                        ec: 0x94d85dd7,
                        pid: 0x9d6c7d1,
                        fixed_seed: 0x723af37c,
                        nature: Nature::from_u32(11).unwrap(),
                        ability: Ability::Second,
                        ivs: IVs(18, 7, 6, 31, 16, 23)
                    },
                    mark: Some(Mark::Uncommon)
                },
                Spawn {
                    advance: 4,
                    spawn: SpawnType::Static,
                    full_seed: (0x6634be77deeab935, 0x2c8c2e721708d07f),
                    dynamic: DynamicStats {
                        ec: 0x94d85dd7,
                        pid: 0x9d6c7d1,
                        fixed_seed: 0x723af37c,
                        nature: Nature::from_u32(11).unwrap(),
                        ability: Ability::Second,
                        ivs: IVs(18, 7, 6, 31, 16, 23)
                    },
                    mark: Some(Mark::Uncommon)
                },
                Spawn {
                    advance: 5,
                    spawn: SpawnType::Static,
                    full_seed: (0xad63b35e95ce5df4, 0x3c4d2949571200b9),
                    dynamic: DynamicStats {
                        ec: 0x323b2e8c,
                        pid: 0x6c0dd0f,
                        fixed_seed: 0xf9dc431,
                        nature: Nature::from_u32(15).unwrap(),
                        ability: Ability::Second,
                        ivs: IVs(10, 0, 27, 20, 31, 0)
                    },
                    mark: Some(Mark::Uncommon)
                },
                Spawn {
                    advance: 6,
                    spawn: SpawnType::Static,
                    full_seed: (0x55ac96966b3c3efe, 0x5b8ba9b225d342f8),
                    dynamic: DynamicStats {
                        ec: 0x323b2e8c,
                        pid: 0x6c0dd0f,
                        fixed_seed: 0xf9dc431,
                        nature: Nature::from_u32(15).unwrap(),
                        ability: Ability::Second,
                        ivs: IVs(10, 0, 27, 20, 31, 0)
                    },
                    mark: Some(Mark::Uncommon)
                },
                Spawn {
                    advance: 7,
                    spawn: SpawnType::Static,
                    full_seed: (0xa7684df5ccbcd090, 0xddef80c1c4e7e489),
                    dynamic: DynamicStats {
                        ec: 0x323b2e8c,
                        pid: 0x6c0dd0f,
                        fixed_seed: 0xf9dc431,
                        nature: Nature::from_u32(15).unwrap(),
                        ability: Ability::Second,
                        ivs: IVs(10, 0, 27, 20, 31, 0)
                    },
                    mark: Some(Mark::Uncommon)
                },
                Spawn {
                    advance: 8,
                    spawn: SpawnType::Static,
                    full_seed: (0x427f79bface55c54, 0xb66832f50f9a681),
                    dynamic: DynamicStats {
                        ec: 0xabc3d19d,
                        pid: 0x38f83bce,
                        fixed_seed: 0x89266742,
                        nature: Nature::from_u32(4).unwrap(),
                        ability: Ability::First,
                        ivs: IVs(6, 12, 5, 24, 5, 27)
                    },
                    mark: Some(Mark::Uncommon)
                },
                Spawn {
                    advance: 9,
                    spawn: SpawnType::Static,
                    full_seed: (0xc25e3d0528b85ac, 0x839f5aa9233f521f),
                    dynamic: DynamicStats {
                        ec: 0x8a97dbf1,
                        pid: 0x1d004a75,
                        fixed_seed: 0x67fa7196,
                        nature: Nature::from_u32(17).unwrap(),
                        ability: Ability::Second,
                        ivs: IVs(30, 10, 1, 12, 28, 13)
                    },
                    mark: Some(Mark::Uncommon)
                },
            ]
        );
    }
}
