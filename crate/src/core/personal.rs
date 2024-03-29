///! Pokedex-type data.
use std::fmt;
use std::fs::File;
use std::io;
use std::io::prelude::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct Mon {
    hp: u8,
    atk: u8,
    def: u8,
    spe: u8,
    spa: u8,
    spd: u8,
    item: (u16, u16),
    /// Held item.
    gender_ratio: u8,
    ability_1: u16,
    ability_2: u16,
    ability_hidden: u16,
    form_stat_index: u16,
    form_count: u8,
    included: bool,
}

#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Copy, Clone)]
pub struct Abilities(pub u16, pub u16, pub u16);

// 176 bytes per mon.
const ENTRY_SIZE: usize = 0xB0;

impl Mon {
    pub fn new(
        hp: u8,
        atk: u8,
        def: u8,
        spe: u8,
        spa: u8,
        spd: u8,
        item: (u16, u16),
        gender_ratio: u8,
        ability_1: u16,
        ability_2: u16,
        ability_hidden: u16,
        form_stat_index: u16,
        form_count: u8,
        included: bool,
    ) -> Self {
        Mon {
            hp,
            atk,
            def,
            spe,
            spa,
            spd,
            item,
            gender_ratio,
            ability_1,
            ability_2,
            ability_hidden,
            form_stat_index,
            form_count,
            included,
        }
    }

    pub fn from_bytes(buf: &[u8; ENTRY_SIZE]) -> Self {
        Mon {
            hp: buf[0],
            atk: buf[1],
            def: buf[2],
            spe: buf[3],
            spa: buf[4],
            spd: buf[5],
            item: (buf[12] as u16, buf[14] as u16),
            gender_ratio: buf[18],
            ability_1: (buf[25] as u16) << 8 | buf[24] as u16,
            ability_2: (buf[27] as u16) << 8 | buf[26] as u16,
            ability_hidden: (buf[29] as u16) << 8 | buf[28] as u16,
            form_stat_index: (buf[31] as u16) << 8 | buf[30] as u16,
            form_count: buf[32],
            included: ((buf[33] >> 6) & 1) == 1,
        }
    }
}

impl fmt::Display for Mon {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Mon::new({}, {}, {}, {}, {}, {}, {:?}, {}, {}, {}, {}, {}, {}, {})",
            self.hp,
            self.atk,
            self.def,
            self.spe,
            self.spa,
            self.spd,
            self.item,
            self.gender_ratio,
            self.ability_1,
            self.ability_2,
            self.ability_hidden,
            self.form_stat_index,
            self.form_count,
            self.included,
        )
    }
}

#[wasm_bindgen]
impl Mon {
    /// Returns abilities.
    pub fn get_abilities(&self) -> Abilities {
        Abilities(self.ability_1, self.ability_2, self.ability_hidden)
    }

    /// Returns the gender ratio.
    pub fn get_gender_ratio(&self) -> u8 {
        self.gender_ratio
    }

    /// Returns the index of the first alternate form.
    pub fn get_form_index(&self) -> usize {
        self.form_stat_index as usize
    }

    /// Returns a list of genders.
    pub fn get_form_count(&self) -> u8 {
        self.form_count
    }
}

#[wasm_bindgen]
#[derive(PartialEq, Eq, Debug, Clone)]
pub struct PersonalTable {
    entries: Vec<Mon>,
}

impl<'a> PersonalTable {
    /// Initializes from an in-memory Vec.
    pub fn new(entries: Vec<Mon>) -> Self {
        PersonalTable { entries }
    }

    /// Reads the personal table binary format into a vector of entries.
    #[allow(dead_code)]
    pub fn from_bytes(path: &str) -> io::Result<Self> {
        let mut f = File::open(path)?;
        let mut buffer = [0; ENTRY_SIZE];
        let mut entries = Vec::new();

        while let Ok(n) = f.read(&mut buffer) {
            if n == 0 {
                break;
            }
            entries.push(Mon::from_bytes(&buffer));
        }

        Ok(PersonalTable { entries })
    }

    /// Returns the information for a given mon.
    pub fn get_info(&'a self, species: usize, form: usize) -> Option<&'a Mon> {
        if let Some(base) = self.entries.get(species) {
            let form_index = base.get_form_index();
            if form == 0 {
                Some(base)
            } else if form >= base.get_form_count() as usize {
                // Form out of bounds.
                None
            } else {
                self.entries.get(form_index + form - 1)
            }
        } else {
            None
        }
    }
}

impl fmt::Display for PersonalTable {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for &mon in self.entries.iter() {
            writeln!(f, "{},", mon)?
        }
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    #[cfg(skip)]
    fn print_info() {
        let table = PersonalTable::from_bytes("resources/personal").unwrap();
        println!("{}", table);
        assert!(false);
    }

    #[test]
    fn test_base_info() {
        let table = PersonalTable::from_bytes("resources/personal").unwrap();

        // Bulbasaur, one form.
        assert_eq!(
            table.get_info(1, 0),
            Some(&Mon {
                hp: 45,
                atk: 49,
                def: 49,
                spe: 45,
                spa: 65,
                spd: 65,
                item: (0, 0),
                gender_ratio: 31,
                ability_1: 65,
                ability_2: 65,
                ability_hidden: 34,
                form_stat_index: 0,
                form_count: 1,
                included: true
            })
        );

        // Eternatus, two forms.
        assert_eq!(
            table.get_info(890, 0),
            Some(&Mon {
                hp: 140,
                atk: 85,
                def: 95,
                spe: 130,
                spa: 145,
                spd: 95,
                item: (0, 0),
                gender_ratio: 255,
                ability_1: 46,
                ability_2: 46,
                ability_hidden: 46,
                form_stat_index: 1187,
                form_count: 2,
                included: true
            })
        );

        // Dewgong, not in Sword/Shield.
        assert_eq!(
            table.get_info(187, 0),
            Some(&Mon {
                hp: 0,
                atk: 0,
                def: 0,
                spe: 0,
                spa: 0,
                spd: 0,
                item: (0, 0),
                gender_ratio: 255,
                ability_1: 0,
                ability_2: 0,
                ability_hidden: 0,
                form_stat_index: 0,
                form_count: 0,
                included: false
            })
        );
    }

    #[test]
    fn test_forms() {
        let table = PersonalTable::from_bytes("resources/personal").unwrap();

        let pumpkaboo = table.get_info(710, 0);
        assert_eq!(
            pumpkaboo,
            Some(&Mon {
                hp: 49,
                atk: 66,
                def: 70,
                spe: 51,
                spa: 44,
                spd: 55,
                item: (0, 0),
                gender_ratio: 127,
                ability_1: 53,
                ability_2: 119,
                ability_hidden: 15,
                form_stat_index: 1116,
                form_count: 4,
                included: true
            })
        );

        // Small size.
        assert_eq!(
            table.get_info(710, 1),
            Some(&Mon {
                hp: 44,
                atk: 66,
                def: 70,
                spe: 56,
                spa: 44,
                spd: 55,
                item: (0, 0),
                gender_ratio: 127,
                ability_1: 53,
                ability_2: 119,
                ability_hidden: 15,
                form_stat_index: 1116,
                form_count: 4,
                included: true
            })
        );

        // Super size.
        assert_eq!(
            table.get_info(710, 3),
            Some(&Mon {
                hp: 59,
                atk: 66,
                def: 70,
                spe: 41,
                spa: 44,
                spd: 55,
                item: (239, 239),
                gender_ratio: 127,
                ability_1: 53,
                ability_2: 119,
                ability_hidden: 15,
                form_stat_index: 1116,
                form_count: 4,
                included: true
            })
        );

        // Nonexistent size.
        assert_eq!(table.get_info(710, 4), None);
    }
}
