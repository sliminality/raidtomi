///! Raid generation parameters.
use super::super::personal_data::get_personal_info;
use super::mon::{Ability, Gender};
use wasm_bindgen::prelude::*;

/// Species of mon.
pub type Species = u32; // TODO: Replace this with an enum eventually.

/// A raid mon can be randomly shiny, always shiny, or never shiny.
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum ShinyPool {
    Random,
    Locked(bool),
}

impl From<u8> for ShinyPool {
    // Converts a u32 into a ShinyPool, based on the game's encoding.
    fn from(n: u8) -> Self {
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

impl From<u8> for AbilityPool {
    // Converts a u32 into a AbilityPool, based on the game's encoding.
    fn from(n: u8) -> Self {
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
    Random(u8),
    Locked(Gender),
}

impl GenderPool {
    // Converts a u32 into a GenderPool, based on the game's encoding.
    fn from(n: u8, ratio: Option<u8>) -> Self {
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
    min_flawless_ivs: u8,
    alt_form: u8,
    is_gmax: bool,
    ability: AbilityPool,
    gender: GenderPool,
    shiny: ShinyPool,
}

#[wasm_bindgen]
impl Raid {
    #[wasm_bindgen(constructor)]
    pub fn new(
        species: Species,
        alt_form: u8,
        min_flawless_ivs: u8,
        is_gmax: bool,
        ability_pool: u8,
        gender_pool: u8,
    ) -> Self {
        let gender_ratio =
            get_personal_info(species as usize, alt_form as usize).map(|pi| pi.get_gender_ratio());

        Raid {
            species,
            min_flawless_ivs,
            alt_form,
            is_gmax,
            ability: AbilityPool::from(ability_pool),
            gender: GenderPool::from(gender_pool, gender_ratio),
            shiny: ShinyPool::Random,
        }
    }
}

impl Raid {
    pub fn get_shiny_pool(&self) -> ShinyPool {
        self.shiny
    }

    pub fn get_min_flawless_ivs(&self) -> u8 {
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

    pub fn get_alt_form(&self) -> u8 {
        self.alt_form
    }
}
