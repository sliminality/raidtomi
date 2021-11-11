///! Characteristics of a mon.
use super::rng::Rng;
use num_derive::{FromPrimitive, ToPrimitive};
use std::fmt;
use wasm_bindgen::prelude::*;

/// Individual Values for a mon's stats.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct IVs(pub u32, pub u32, pub u32, pub u32, pub u32, pub u32);

impl fmt::Display for IVs {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{}/{}/{}/{}/{}/{}",
            self.0, self.1, self.2, self.3, self.4, self.5
        )
    }
}

/// Whether a mon is shiny, and if so, what type of shiny.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum Shininess {
    None,
    Star,
    Square,
}

impl fmt::Display for Shininess {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let symbol = match self {
            Shininess::None => "",
            Shininess::Star => "★",
            Shininess::Square => "■",
        };
        write!(f, "{}", symbol)
    }
}

/// What ability a mon has.
/// Not all mons have a second ability or HA.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum Ability {
    First,
    Second,
    Hidden,
}

impl fmt::Display for Ability {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{}",
            match self {
                Ability::First => "1",
                Ability::Second => "2",
                Ability::Hidden => "HA",
            }
        )
    }
}

/// What gender a mon has.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum Gender {
    Male,
    Female,
    Genderless,
}

/// What nature a mon has.
/// Nature determines the pace of stat progression.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone, FromPrimitive, ToPrimitive)]
pub enum Nature {
    Hardy = 0,
    Lonely = 1,
    Brave = 2,
    Adamant = 3,
    Naughty = 4,
    Bold = 5,
    Docile = 6,
    Relaxed = 7,
    Impish = 8,
    Lax = 9,
    Timid = 10,
    Hasty = 11,
    Serious = 12,
    Jolly = 13,
    Naive = 14,
    Modest = 15,
    Mild = 16,
    Quiet = 17,
    Bashful = 18,
    Rash = 19,
    Calm = 20,
    Gentle = 21,
    Sassy = 22,
    Careful = 23,
    Quirky = 24,
}

// Toxtricity evolves into Amped Form if it has a certain set of natures,
// and Low Key Form otherwise.
static TOXTRICITY_AMPED_NATURES: [Nature; 12] = [
    Nature::Lonely,
    Nature::Bold,
    Nature::Relaxed,
    Nature::Timid,
    Nature::Serious,
    Nature::Modest,
    Nature::Mild,
    Nature::Quiet,
    Nature::Bashful,
    Nature::Calm,
    Nature::Gentle,
    Nature::Careful,
];

static TOXTRICITY_LOW_KEY_NATURES: [Nature; 13] = [
    Nature::Hardy,
    Nature::Brave,
    Nature::Adamant,
    Nature::Naughty,
    Nature::Docile,
    Nature::Impish,
    Nature::Lax,
    Nature::Hasty,
    Nature::Jolly,
    Nature::Naive,
    Nature::Rash,
    Nature::Sassy,
    Nature::Quirky,
];

/// Generates a Toxtricity nature.
pub fn get_toxtricity_nature(rng: &mut Rng, is_amped: bool) -> Nature {
    if is_amped {
        let index = rng.next_int_max(TOXTRICITY_AMPED_NATURES.len() as u32);
        TOXTRICITY_AMPED_NATURES[index as usize]
    } else {
        let index = rng.next_int_max(TOXTRICITY_LOW_KEY_NATURES.len() as u32);
        TOXTRICITY_LOW_KEY_NATURES[index as usize]
    }
}

/// Possible overworld marks.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone, FromPrimitive, ToPrimitive)]
pub enum PersonalityMark {
    Rowdy = 0,
    AbsentMinded = 1,
    Jittery = 2,
    Excited = 3,
    Charismatic = 4,
    Calmness = 5,
    Intense = 6,
    ZonedOut = 7,
    Joyful = 8,
    Angry = 9,
    Smiley = 10,
    Teary = 11,
    Upbeat = 12,
    Peeved = 13,
    Intellectual = 14,
    Ferocious = 15,
    Crafty = 16,
    Scowling = 17,
    Kindly = 18,
    Flustered = 19,
    PumpedUp = 20,
    ZeroEnergy = 21,
    Prideful = 22,
    Unsure = 23,
    Humble = 24,
    Thorny = 25,
    Vigor = 26,
    Slump = 27,
}

#[derive(PartialEq, Eq, Debug)]
pub enum Mark {
    Rare,
    Personality(PersonalityMark),
    Uncommon,
    Weather,
    Time,
    Fishing,
}

impl fmt::Display for Mark {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Mark::Personality(m) => write!(f, "{:?}", m),
            m => write!(f, "{:?}", m),
        }
    }
}

#[cfg(test)]
mod test {
    use super::Nature;
    use num_traits::{FromPrimitive, ToPrimitive};

    /// Test conversion between natures.
    #[test]
    fn test_natures() {
        assert_eq!(Nature::from_u32(10), Some(Nature::Timid));
        assert_eq!(Some(24), (Nature::Quirky).to_u32());

        // Fails for unrecognized primitives.
        assert_eq!(Nature::from_u32(25), None);
    }
}
