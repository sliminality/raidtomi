# `raidtomi`

Raidtomi is a Web-based tool for Max Raid RNG manipulation in Pokémon Sword and Shield (Gen 8). Core seed searching and RNG logic is written in Rust and compiled to WebAssembly using [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen). You can try it online at [raidtomi.com](https://raidtomi.com).

The goal is to combine the Web-based convenience of [Leanny's Seed Checker](https://leanny.github.io/seedchecker/) with the performance of native desktop tools like [RaidFinder](https://github.com/Admiral-Fish/RaidFinder).

### Compatibility

Currently, Raidtomi only works in desktop Firefox and Chrome, and Android mobile browsers. This is because Safari [does not currently support](https://bugs.webkit.org/show_bug.cgi?id=190800) BigInt64Array and BigUint64Array, both of which are used in wasm-bindgen.

## Acknowledgements

Thanks to the following people:

- [AdmiralFish](https://github.com/Admiral-Fish/) for creating [RaidFinder](https://github.com/Admiral-Fish/RaidFinder), documenting [raid generation](https://github.com/Admiral-Fish/RNGWriteups/blob/master/Gen%208/Raid%20Generation.md), and answering all of my questions on Discord
- [Leanny](https://github.com/leanny) for creating [Seed Checker](https://leanny.github.io/seedchecker/), the inspiration for this project, as well as base game and IoA raid tables
- [Kaphotics](https://github.com/kwsch) for open-sourcing the personal data binary through [PKHeX](https://github.com/kwsch/PKHeX)
- [zaksabeast](https://github.com/zaksabeast) and [Shiny_Sylveon](https://github.com/ShinySylveon04) for dumping Crown Tundra raid tables
