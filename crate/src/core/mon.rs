use super::rng::Rng;
///! Characteristics of a mon.
use num_derive::{FromPrimitive, ToPrimitive};
use wasm_bindgen::prelude::*;

/// Individual Values for a mon's stats.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct IVs(pub u32, pub u32, pub u32, pub u32, pub u32, pub u32);

/// Whether a mon is shiny, and if so, what type of shiny.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum Shininess {
    None,
    Star,
    Square,
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
