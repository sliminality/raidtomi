use wasm_bindgen::prelude::*;

mod core;

use self::core::filter::FrameFilter;
use self::core::frame::{Frame, FrameGenerator};
use self::core::raid::Raid;
use js_sys;
use std::iter::FromIterator;

cfg_if::cfg_if! {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function to get better error messages if we ever panic.
    if #[cfg(feature = "console_error_panic_hook")] {
        extern crate console_error_panic_hook;
        use console_error_panic_hook::set_once as set_panic_hook;
    } else {
        #[inline]
        fn set_panic_hook() {}
    }
}

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn run() -> Result<(), JsValue> {
    // If the `console_error_panic_hook` feature is enabled this will set a panic hook, otherwise
    // it will do nothing.
    set_panic_hook();
    Ok(())
}

/// Return a Raid configuration from parameters.
#[wasm_bindgen]
pub fn create_raid(
    min_flawless_ivs: u32,
    ability: u32,
    gender: u32,
    gender_ratio: Option<u32>,
) -> Raid {
    Raid::new(
        0, // TODO: Replace with real species id!
        min_flawless_ivs,
        0,
        false,
        ability,
        gender,
        gender_ratio,
        0,
    )
}

/// List a certain number of frames, beginning with some seed.
#[wasm_bindgen]
pub fn list_frames(raid: Raid, seed: u64, num_frames: usize) -> js_sys::Array {
    let f = FrameGenerator::new(raid, seed);
    let frames = f.take(num_frames).map(|f| f.get()).map(JsValue::from);
    js_sys::Array::from_iter(frames)
}

/// Search for a frame matching the given filter.
#[wasm_bindgen]
pub fn search(raid: Raid, seed: u64, filter: FrameFilter) -> Frame {
    let mut f = FrameGenerator::new(raid, seed);
    f.set_filter(filter);
    f.find(|&f| if let Some(_) = f.get() { true } else { false })
        .map(|f| f.get())
        .flatten()
        .unwrap()
}
