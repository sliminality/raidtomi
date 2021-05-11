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

declare type Values<T extends unknown> = {
    [K in keyof T]: T[K]
}[keyof T]

declare function unreachable(): never

declare type Result<T, E> =
    | { type: "ok"; value: T; error?: undefined }
    | { type: "err"; error: E }

/**
 * Overload `map` on tuples to preserve length.
 * https://github.com/microsoft/TypeScript/issues/5453#issuecomment-746158223
 */
interface Array<T> {
    map<U>(
        this: Array<T>,
        callback: (value: T, index: number, array: this) => U,
        thisArg?: this,
    ): {
        [index in keyof this]: U
    }
}

declare type Assert<T extends U, U> = T