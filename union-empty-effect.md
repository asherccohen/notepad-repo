Here’s a detailed Confluence-ready document summarizing both problems and their solutions using effect/schema.


---

🛠 Form Validation with effect/schema: Handling either-or Required Fields and Empty Optional Strings

This page documents two common problems encountered when integrating effect/schema with HTML form inputs (e.g. via FormData), and how to solve them idiomatically.


---

✅ Problem 1: Enforcing “At Least One Field Required” Logic

📌 Goal

You have a form where either fieldA, fieldB, or both must be filled. This maps to a typical anyOf pattern in JSON Schema:

{
  "anyOf": [
    { "required": ["fieldA"] },
    { "required": ["fieldB"] }
  ]
}

🧨 The Challenge

effect/schema doesn’t have a built-in anyOf, so we need to express this logic manually.


---

✅ Solution 1A: Schema Union (Mirrors JSON Schema)

import * as S from "effect/schema/Schema"

const EitherOr = S.union(
  S.struct({ fieldA: S.string, fieldB: S.optional(S.string) }),
  S.struct({ fieldA: S.optional(S.string), fieldB: S.string })
)

Each variant reflects one valid "required field" case.

Validation fails if neither is provided.

TypeScript type:

| { fieldA: string; fieldB?: string }
| { fieldA?: string; fieldB: string }



---

✅ Solution 1B: Refinement Over Base Shape

const AtLeastOne = S.struct({
  fieldA: S.optional(S.string),
  fieldB: S.optional(S.string),
}).pipe(
  S.refine(
    input => !!input.fieldA || !!input.fieldB,
    { message: () => "At least one of fieldA or fieldB is required" }
  )
)

Keeps a single object shape.

Validation is post-struct, through a logical check.

Easier to read and maintain if field types are uniform.



---

✅ Problem 2: Optional Fields Always Come as "" from FormData

📌 Goal

You're working with <form> inputs processed via FormData. Even when users leave an optional field blank, the value comes through as "", not undefined.

This breaks typical validation like:

S.optional(S.string.pipe(S.minLength(1)))

Because "" still gets validated and fails the minLength.


---

🧨 The Challenge

You want to:

Allow empty/blank values for optional fields ("" → undefined)

Enforce minLength(1) only when a value is present

Show custom error messages when the string is invalid



---

✅ Solution: Normalize "" to undefined via transformOrFail

import * as S from "effect/schema/Schema"
import * as ParseResult from "effect/schema/ParseResult"

// Normalize "" to undefined
const normalizeEmptyStringToUndefined = S.transformOrFail(
  S.string,
  S.optional(S.string),
  (value) => value.trim() === "" 
    ? ParseResult.succeed(undefined) 
    : ParseResult.succeed(value),
  (value) => value === undefined 
    ? ParseResult.succeed("") 
    : ParseResult.succeed(value)
)

// Compose into final field schema
const optionalNonEmptyField = normalizeEmptyStringToUndefined.pipe(
  S.optional(
    S.string.pipe(
      S.minLength(1).pipe(
        S.annotations({ message: "Must be at least 1 character" })
      )
    )
  )
)

✅ Usage Example

const Schema = S.struct({
  nickname: optionalNonEmptyField
})

Valid:

{ nickname: undefined }
{ nickname: "" }  // normalized to undefined
{ nickname: "hello" }

Invalid:

{ nickname: "" }  // if you remove the normalize step
{ nickname: " " } // if you add stricter trim/length logic


---

🧪 Final Notes

Use S.union(...) to mirror anyOf semantics from JSON Schema.

Use .refine(...) for logical constraints across fields.

Normalize "" → undefined early when working with FormData.

Add .annotations({ message }) after each validation step for field-specific error messages.



---

Let me know if you'd like reusable helpers for common patterns like optionalTrimmedString, atLeastOne(fields: string[]), or full schema-from-JSON conversion logic.

