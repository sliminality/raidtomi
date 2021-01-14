// Parcel references the Rust crate by importing its Cargo.toml file,
// but TypeScript can't resolve the import or access any of the types
// generated by wasm-bindgen.
//
// As a workaround, we define this wildcard module declaration
// (aka TypeScript's way of supporting non-JS loaders) and use dynamic
// import() to get the real types produced by wasm-bindgen.
// https://github.com/rustwasm/wasm-bindgen/issues/182#issuecomment-487928242
declare module "*.toml" {
    const _: typeof import("../../crate/pkg/raidtomi")
    export default _
}
