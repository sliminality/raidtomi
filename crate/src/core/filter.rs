///! Filters to apply when searching for a particular frame.
use super::mon::{Ability, Gender, IVs, Shininess};
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
    Decent,     // 1-10
    PrettyGood, // 11-20
    VeryGood,   // 21-29
    Fantastic,  // 30
    Best,       // 31
}

impl PartialEq<u32> for IVJudgment {
    fn eq(&self, other: &u32) -> bool {
        match self {
            Self::NoGood => *other == 0,
            Self::Decent => *other >= 1 && *other <= 10,
            Self::PrettyGood => *other >= 11 && *other <= 20,
            Self::VeryGood => *other >= 21 && *other <= 29,
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
                } else if (1..=10).contains(other) {
                    Some(Ordering::Equal)
                } else {
                    Some(Ordering::Less)
                }
            }
            Self::PrettyGood => {
                if *other < 11 {
                    Some(Ordering::Greater)
                } else if (11..=20).contains(other) {
                    Some(Ordering::Equal)
                } else {
                    Some(Ordering::Less)
                }
            }
            Self::VeryGood => {
                if *other < 21 {
                    Some(Ordering::Greater)
                } else if (21..=29).contains(other) {
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
        } else if let Some(filter) = self.1 {
            if !filter.test(&value.1) {
                return false;
            }
        } else if let Some(filter) = self.2 {
            if !filter.test(&value.2) {
                return false;
            }
        } else if let Some(filter) = self.3 {
            if !filter.test(&value.3) {
                return false;
            }
        } else if let Some(filter) = self.4 {
            if !filter.test(&value.4) {
                return false;
            }
        } else if let Some(filter) = self.5 {
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

/// Filter aspects of a frame.
#[wasm_bindgen(inspectable)]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct FrameFilter {
    pub shiny: Option<ShinyFilter>,
    pub ivs: Option<IVFilter>,
    pub ability: Option<AbilityFilter>,
    pub gender: Option<GenderFilter>,
    // TODO: Add nature filter, probably using a bit vector.
}

#[wasm_bindgen]
impl FrameFilter {
    pub fn new() -> Self {
        FrameFilter {
            shiny: None,
            ivs: None,
            ability: None,
            gender: None,
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

    pub fn set_ability(&mut self, filter: AbilityFilter) -> Self {
        self.ability = Some(filter);
        *self
    }

    pub fn set_gender(&mut self, filter: GenderFilter) -> Self {
        self.gender = Some(filter);
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
        assert!(IVJudgment::Decent == 10);
        assert!(IVJudgment::Decent > 0);
        assert!(IVJudgment::Decent < 11);
        assert!(IVJudgment::PrettyGood == 11);
        assert!(IVJudgment::PrettyGood == 15);
        assert!(IVJudgment::PrettyGood == 20);
        assert!(IVJudgment::PrettyGood > 10);
        assert!(IVJudgment::PrettyGood < 21);
        assert!(IVJudgment::VeryGood == 21);
        assert!(IVJudgment::VeryGood == 25);
        assert!(IVJudgment::VeryGood == 29);
        assert!(IVJudgment::VeryGood > 20);
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
    fn test_iv_test() {
        let iv = SingleIVFilter::new_at_least(IVJudgment::PrettyGood);
        assert!(iv.test(&11));
        assert!(iv.test(&31));
        assert!(!iv.test(&9));
        assert!(!iv.test(&0));

        let iv = SingleIVFilter::new_at_most(IVJudgment::NoGood);
        assert!(iv.test(&0));
        assert!(!iv.test(&1));
        assert!(!iv.test(&31));
    }

    #[test]
    fn test_shiny_test() {
        assert!(ShinyFilter::Shiny.test(&Shininess::Square));
        assert!(ShinyFilter::Shiny.test(&Shininess::Star));
        assert!(!ShinyFilter::Shiny.test(&Shininess::None));

        assert!(ShinyFilter::Square.test(&Shininess::Square));
        assert!(!ShinyFilter::Square.test(&Shininess::Star));
        assert!(!ShinyFilter::Square.test(&Shininess::None));
    }

    #[test]
    fn test_ability_test() {
        assert!(AbilityFilter::First.test(&Ability::First));
        assert!(!AbilityFilter::First.test(&Ability::Second));
        assert!(!AbilityFilter::First.test(&Ability::Hidden));
    }

    #[test]
    fn test_gender_test() {
        assert!(GenderFilter::Male.test(&Gender::Male));
        assert!(!GenderFilter::Male.test(&Gender::Female));
        assert!(!GenderFilter::Male.test(&Gender::Genderless));
    }

    #[test]
    fn test_valid_frame_filter() {
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
            );

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
                gender: Some(GenderFilter::Male)
            }
        )
    }
}
