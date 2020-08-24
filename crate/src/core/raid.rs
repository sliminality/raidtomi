///! Raid generation parameters.
use super::mon::{Ability, Gender};
use wasm_bindgen::prelude::*;

/// Species of mon.
type Species = u32; // TODO: Replace this with an enum eventually.

/// A raid mon can be randomly shiny, always shiny, or never shiny.
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum ShinyPool {
    Random,
    Locked(bool),
}

impl From<u32> for ShinyPool {
    // Converts a u32 into a ShinyPool, based on the game's encoding.
    fn from(n: u32) -> Self {
        match n {
            n if n == 0 => ShinyPool::Random,
            n if n == 1 => ShinyPool::Locked(false),
            _ => ShinyPool::Locked(true),
        }
    }
}

/// Which abilities can be rolled.
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum AbilityPool {
    Random,
    NoHA,
    Locked(Ability),
}

impl From<u32> for AbilityPool {
    // Converts a u32 into a AbilityPool, based on the game's encoding.
    fn from(n: u32) -> Self {
        match n {
            n if n == 4 => AbilityPool::Random,
            n if n == 3 => AbilityPool::NoHA,
            n if n == 2 => AbilityPool::Locked(Ability::Hidden),
            n if n == 1 => AbilityPool::Locked(Ability::Second),
            n if n == 0 => AbilityPool::Locked(Ability::First),
            _ => panic!("Invalid ability type"),
        }
    }
}

/// Which genders can be rolled.
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum GenderPool {
    Random(u32),
    Locked(Gender),
}

impl GenderPool {
    // Converts a u32 into a GenderPool, based on the game's encoding.
    fn from(n: u32, ratio: Option<u32>) -> Self {
        match n {
            n if n == 0 => GenderPool::Random(ratio.unwrap()),
            n if n == 1 => GenderPool::Locked(Gender::Male),
            n if n == 2 => GenderPool::Locked(Gender::Female),
            n if n == 3 => GenderPool::Locked(Gender::Genderless),
            _ => panic!("Invalid gender type"),
        }
    }
}

/// Represents a raid mon's possible stats: form, gender, ability, IVs, etc.
/// These are defined in the game data and control things.
#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct Raid {
    species: Species,
    min_flawless_ivs: u32,
    alt_form: u32, // Only used for Toxtricity.
    is_gmax: bool,
    ability: AbilityPool,
    gender: GenderPool,
    shiny: ShinyPool,
}

impl Raid {
    pub fn new(
        species: Species,
        min_flawless_ivs: u32,
        alt_form: u32, // Only used for Toxtricity.
        is_gmax: bool,
        ability: u32,
        gender: u32,
        gender_ratio: Option<u32>,
        shiny: u32,
    ) -> Self {
        Raid {
            species,
            min_flawless_ivs,
            alt_form,
            is_gmax,
            ability: AbilityPool::from(ability),
            gender: GenderPool::from(gender, gender_ratio),
            shiny: ShinyPool::from(shiny),
        }
    }

    pub fn get_shiny_pool(&self) -> ShinyPool {
        self.shiny
    }

    pub fn get_min_flawless_ivs(&self) -> u32 {
        self.min_flawless_ivs
    }

    pub fn get_ability_pool(&self) -> AbilityPool {
        self.ability
    }

    pub fn get_gender_pool(&self) -> GenderPool {
        self.gender
    }

    pub fn get_species(&self) -> Species {
        self.species
    }

    pub fn get_alt_form(&self) -> u32 {
        self.alt_form
    }
}
