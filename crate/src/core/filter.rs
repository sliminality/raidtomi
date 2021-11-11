///! Filters to apply when searching for a particular frame.
use super::mon::{Ability, Gender, IVs, Nature, Shininess};
use num_traits::ToPrimitive;
use std::cmp::Ordering;
use wasm_bindgen::prelude::*;

/// A trait that can be tested against a field from a Frame.
pub trait Filter<T> {
    fn test(&self, _: &T) -> bool;
}

/// Specifies bounds for a single IV.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum IVJudgment {
    NoGood,     // 0
    Decent,     // 1-15
    PrettyGood, // 16-25
    VeryGood,   // 26-29
    Fantastic,  // 30
    Best,       // 31
}

impl PartialEq<u32> for IVJudgment {
    fn eq(&self, other: &u32) -> bool {
        match self {
            Self::NoGood => *other == 0,
            Self::Decent => *other >= 1 && *other <= 15,
            Self::PrettyGood => *other >= 16 && *other <= 25,
            Self::VeryGood => *other >= 26 && *other <= 29,
            Self::Fantastic => *other == 30,
            Self::Best => *other == 31,
        }
    }
}

impl PartialOrd<u32> for IVJudgment {
    fn partial_cmp(&self, other: &u32) -> Option<Ordering> {
        if *other > 31 {
            return None;
        }

        match self {
            Self::NoGood => {
                if *other == 0 {
                    Some(Ordering::Equal)
                } else {
                    Some(Ordering::Less)
                }
            }
            Self::Decent => {
                if *other < 1 {
                    Some(Ordering::Greater)
                } else if (1..=15).contains(other) {
                    Some(Ordering::Equal)
                } else {
                    Some(Ordering::Less)
                }
            }
            Self::PrettyGood => {
                if *other < 16 {
                    Some(Ordering::Greater)
                } else if (16..=25).contains(other) {
                    Some(Ordering::Equal)
                } else {
                    Some(Ordering::Less)
                }
            }
            Self::VeryGood => {
                if *other < 26 {
                    Some(Ordering::Greater)
                } else if (26..=29).contains(other) {
                    Some(Ordering::Equal)
                } else {
                    Some(Ordering::Less)
                }
            }
            Self::Fantastic => {
                if *other < 30 {
                    Some(Ordering::Greater)
                } else if *other == 30 {
                    Some(Ordering::Equal)
                } else {
                    Some(Ordering::Less)
                }
            }
            Self::Best => {
                if *other < 31 {
                    Some(Ordering::Greater)
                } else if *other == 31 {
                    Some(Ordering::Equal)
                } else {
                    None
                }
            }
        }
    }
}

#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum RangeDirection {
    AtLeast,
    AtMost,
}

#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct SingleIVFilter {
    judgment: IVJudgment,
    direction: RangeDirection,
}

#[wasm_bindgen(inspectable)]
impl SingleIVFilter {
    pub fn new_at_least(judgment: IVJudgment) -> Self {
        SingleIVFilter {
            judgment,
            direction: RangeDirection::AtLeast,
        }
    }

    pub fn new_at_most(judgment: IVJudgment) -> Self {
        SingleIVFilter {
            judgment,
            direction: RangeDirection::AtMost,
        }
    }
}

impl Filter<u32> for SingleIVFilter {
    fn test(&self, value: &u32) -> bool {
        match self.direction {
            RangeDirection::AtLeast => self.judgment <= *value,
            RangeDirection::AtMost => self.judgment >= *value,
        }
    }
}

#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct IVFilter(
    Option<SingleIVFilter>,
    Option<SingleIVFilter>,
    Option<SingleIVFilter>,
    Option<SingleIVFilter>,
    Option<SingleIVFilter>,
    Option<SingleIVFilter>,
);

impl Filter<IVs> for IVFilter {
    fn test(&self, value: &IVs) -> bool {
        if let Some(filter) = self.0 {
            if !filter.test(&value.0) {
                return false;
            }
        }
        if let Some(filter) = self.1 {
            if !filter.test(&value.1) {
                return false;
            }
        }
        if let Some(filter) = self.2 {
            if !filter.test(&value.2) {
                return false;
            }
        }
        if let Some(filter) = self.3 {
            if !filter.test(&value.3) {
                return false;
            }
        }
        if let Some(filter) = self.4 {
            if !filter.test(&value.4) {
                return false;
            }
        }
        if let Some(filter) = self.5 {
            if !filter.test(&value.5) {
                return false;
            }
        }
        true
    }
}

/// Specifies shininess.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum ShinyFilter {
    Shiny = 0,  // Either star or square.
    Square = 1, // Square only.
}

impl Filter<Shininess> for ShinyFilter {
    fn test(&self, value: &Shininess) -> bool {
        match &self {
            Self::Shiny => *value != Shininess::None,
            Self::Square => *value == Shininess::Square,
        }
    }
}

/// Specifies ability.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum AbilityFilter {
    First = 0,
    Second = 1,
    Hidden = 2,
}

impl Filter<Ability> for AbilityFilter {
    fn test(&self, value: &Ability) -> bool {
        match &self {
            Self::First => *value == Ability::First,
            Self::Second => *value == Ability::Second,
            Self::Hidden => *value == Ability::Hidden,
        }
    }
}

/// Specifies gender.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub enum GenderFilter {
    Male = 0,
    Female = 1,
}

impl Filter<Gender> for GenderFilter {
    fn test(&self, value: &Gender) -> bool {
        match &self {
            Self::Male => *value == Gender::Male,
            Self::Female => *value == Gender::Female,
        }
    }
}

/// Specifies nature.
///
/// Nature filter is implemented as a little-endian bit vector of length 25:
/// - `Hardy` is index 0, so its filter is `0000000000000000000000001`
/// - `Bashful` is index 18, so the filter for "Bashful OR Hardy" is 0000001000000000000000001 There should only be one way to express "anything goes": by not passing
/// a filter at all.
/// - `Anything goes` is 1111111111111111111111111 There should only be one way to express "anything goes": by not passing
/// a filter at all.
///
/// By default, we use 0. There should only be one way to express "anything goes": by not passing
/// a filter at all.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct NatureFilter(u32);

// How many natures exist in total?
const NATURE_COUNT: u32 = 25;

fn nature_u32_to_bv(nature: u32) -> u32 {
    2_u32
        .checked_pow(nature)
        .expect("Nature must be a u32 between 0 and 24")
}

#[wasm_bindgen]
impl NatureFilter {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        // Default to disallowing ALL natures. If we wanted "anything goes",
        // the filter should be None instead of Some(DEFAULT_FILTER).
        Self(0)
    }

    pub fn from_vec(vec: Vec<u32>) -> Self {
        let mut bv = 0;
        for &nature in vec.iter() {
            // Check if nature is between 0 and 24.
            if nature <= NATURE_COUNT - 1 {
                bv |= nature_u32_to_bv(nature)
            }
        }
        Self(bv)
    }
}

// Non-wasm-bindgen methods.
impl NatureFilter {
    pub fn from_natures(vec: Vec<Nature>) -> Self {
        let natures = vec
            .iter()
            .map(ToPrimitive::to_u32)
            .collect::<Option<Vec<_>>>()
            .expect("Some natures could not be converted to u32");

        Self::from_vec(natures)
    }
}

impl Filter<Nature> for NatureFilter {
    fn test(&self, value: &Nature) -> bool {
        // Convert nature to bit vector representation.
        if let Some(nature) = value.to_u32() {
            nature_u32_to_bv(nature) & self.0 > 0
        } else {
            panic!("Cannot convert nature to u32");
        }
    }
}

/// Filter aspects of a frame.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct FrameFilter {
    pub shiny: Option<ShinyFilter>,
    pub ivs: Option<IVFilter>,
    pub ability: Option<AbilityFilter>,
    pub gender: Option<GenderFilter>,
    pub nature: Option<NatureFilter>,
}

#[wasm_bindgen]
impl FrameFilter {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        FrameFilter {
            shiny: None,
            ivs: None,
            ability: None,
            gender: None,
            nature: None,
        }
    }

    pub fn set_shiny(&mut self, filter: ShinyFilter) -> Self {
        self.shiny = Some(filter);
        *self
    }

    pub fn set_ivs(
        &mut self,
        hp: Option<SingleIVFilter>,
        atk: Option<SingleIVFilter>,
        def: Option<SingleIVFilter>,
        spa: Option<SingleIVFilter>,
        spd: Option<SingleIVFilter>,
        spe: Option<SingleIVFilter>,
    ) -> Self {
        self.ivs = Some(IVFilter(hp, atk, def, spa, spd, spe));
        *self
    }

    // TODO: Use macros to deduplicate this code.
    pub fn set_ability(&mut self, filter: AbilityFilter) -> Self {
        self.ability = Some(filter);
        *self
    }

    pub fn set_gender(&mut self, filter: GenderFilter) -> Self {
        self.gender = Some(filter);
        *self
    }

    pub fn set_nature(&mut self, filter: NatureFilter) -> Self {
        self.nature = Some(filter);
        *self
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_iv_cmp() {
        assert!(IVJudgment::NoGood == 0);
        assert!(IVJudgment::NoGood < 1);
        assert!(IVJudgment::Decent == 1);
        assert!(IVJudgment::Decent == 5);
        assert!(IVJudgment::Decent == 15);
        assert!(IVJudgment::Decent > 0);
        assert!(IVJudgment::Decent < 16);
        assert!(IVJudgment::PrettyGood == 16);
        assert!(IVJudgment::PrettyGood == 20);
        assert!(IVJudgment::PrettyGood == 25);
        assert!(IVJudgment::PrettyGood > 15);
        assert!(IVJudgment::PrettyGood < 26);
        assert!(IVJudgment::VeryGood == 26);
        assert!(IVJudgment::VeryGood == 27);
        assert!(IVJudgment::VeryGood == 29);
        assert!(IVJudgment::VeryGood > 25);
        assert!(IVJudgment::VeryGood < 30);
        assert!(IVJudgment::Fantastic == 30);
        assert!(IVJudgment::Fantastic > 29);
        assert!(IVJudgment::Fantastic < 31);
        assert!(IVJudgment::Best == 31);
        assert!(IVJudgment::Best > 30);
    }

    #[test]
    #[should_panic]
    fn test_invalid_iv_cmp() {
        assert!(IVJudgment::Decent < 33);
        assert!(IVJudgment::Best < 10000);
    }

    #[test]
    fn test_iv_filter() {
        let iv = SingleIVFilter::new_at_least(IVJudgment::PrettyGood);
        assert!(iv.test(&16));
        assert!(iv.test(&31));
        assert!(!iv.test(&9));
        assert!(!iv.test(&0));

        let iv = SingleIVFilter::new_at_most(IVJudgment::NoGood);
        assert!(iv.test(&0));
        assert!(!iv.test(&1));
        assert!(!iv.test(&31));
    }

    #[test]
    fn test_shiny_filter() {
        assert!(ShinyFilter::Shiny.test(&Shininess::Square));
        assert!(ShinyFilter::Shiny.test(&Shininess::Star));
        assert!(!ShinyFilter::Shiny.test(&Shininess::None));

        assert!(ShinyFilter::Square.test(&Shininess::Square));
        assert!(!ShinyFilter::Square.test(&Shininess::Star));
        assert!(!ShinyFilter::Square.test(&Shininess::None));
    }

    #[test]
    fn test_ability_filter() {
        assert!(AbilityFilter::First.test(&Ability::First));
        assert!(!AbilityFilter::First.test(&Ability::Second));
        assert!(!AbilityFilter::First.test(&Ability::Hidden));
    }

    #[test]
    fn test_gender_filter() {
        assert!(GenderFilter::Male.test(&Gender::Male));
        assert!(!GenderFilter::Male.test(&Gender::Female));
        assert!(!GenderFilter::Male.test(&Gender::Genderless));
    }

    #[test]
    fn test_nature_filter() {
        assert!(
            NatureFilter::from_natures(vec![Nature::Hardy, Nature::Timid, Nature::Relaxed,])
                .test(&Nature::Timid)
        );
        assert!(!NatureFilter::from_natures(vec![Nature::Hardy]).test(&Nature::Timid));
    }

    #[test]
    fn test_nature_disallows_all_by_default() {
        assert!(!NatureFilter::from_vec(Vec::new()).test(&Nature::Timid));
        assert!(!NatureFilter::new().test(&Nature::Timid));
    }

    #[test]
    fn test_valid_frame_filter() {
        let natures = NatureFilter::from_natures(vec![Nature::Timid, Nature::Bold]);

        let f = FrameFilter::new()
            .set_ability(AbilityFilter::Second)
            .set_gender(GenderFilter::Male)
            .set_shiny(ShinyFilter::Square)
            .set_ivs(
                None,
                Some(SingleIVFilter::new_at_most(IVJudgment::Decent)),
                None,
                None,
                None,
                Some(SingleIVFilter::new_at_least(IVJudgment::Best)),
            )
            .set_nature(natures);

        assert_eq!(
            f,
            FrameFilter {
                shiny: Some(ShinyFilter::Square),
                ivs: Some(IVFilter(
                    None,
                    Some(SingleIVFilter {
                        direction: RangeDirection::AtMost,
                        judgment: IVJudgment::Decent
                    }),
                    None,
                    None,
                    None,
                    Some(SingleIVFilter {
                        direction: RangeDirection::AtLeast,
                        judgment: IVJudgment::Best
                    })
                )),
                ability: Some(AbilityFilter::Second),
                gender: Some(GenderFilter::Male),
                nature: Some(natures)
            }
        )
    }
}
