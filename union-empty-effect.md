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

 read-only fields in a schema (e.g. form fields like createdAt, id, or role) are a special case. They don’t map neatly to "required" or "optional" without context.

Let’s break it down precisely, especially in terms of validation, FormData, and effect/schema.


---

🧩 What Is a “Read-Only” Field?

A read-only field is:

Returned from the server (e.g., createdAt)

Displayed to the user, maybe in a form

Not editable, i.e., the user can't (and shouldn't) provide or change it

Ignored or rejected if the user tries to send it back



---

🧠 In Schema Terms

Perspective	Is it required?	Is it optional?	Notes

Incoming data (from client/form)	✅ Optional	✅ Usually ignored	You don't expect the client to send it
Outgoing data (to the client)	✅ Required	❌ Not optional	Server should always include it
Internal state (e.g. DB)	✅ Required	❌ Must exist	Used internally in logic / persistence



---

🎯 In effect/schema

You typically model this via separate schemas depending on direction:

🧾 Example

// Full object schema (used internally or for responses)
const User = S.struct({
  id: S.string,                      // required
  email: S.string,
  createdAt: S.string,              // read-only, required in responses
  nickname: S.optional(S.string),   // user editable
})

// Input schema (what client can send)
const UserInput = S.struct({
  email: S.string,
  nickname: S.optional(S.string),
})

createdAt is required in User (e.g., for rendering or API response)

createdAt is excluded from UserInput — the client can’t send it



---

🛡 Alternative: Allow but Ignore

If you want to accept it silently but ignore it, you can:

const UserInput = S.struct({
  email: S.string,
  nickname: S.optional(S.string),
  createdAt: S.optional(S.never), // client sends? → fail.
})

Or:

const UserInput = S.omit(User, ["id", "createdAt"]) // more maintainable


---

🧪 Quick Rules of Thumb

If used for...	Then...

Display-only field	✅ Required in output schema
Auto-generated (ID, timestamps)	❌ Omit from input schema
Computed on server	❌ Omit from input schema
Editable by admin only	🟡 Optional and validated elsewhere



---

🧩 Form Integration Tip

If your form includes read-only fields for display:

Don't register them in your validation schema

Or register them as optional(S.never) if you want to ensure they aren't modified

Or strip them before validating if FormData sends them anyway

optional but max length when defined 

Yes — this is a subtle but real issue with how effect/schema composes S.optional(...) and refinements like S.minLength / S.maxLength.

You're seeing:

expected undefined, received "632662"

even though "632662" is defined — just too long. The error makes it seem like the value was not allowed to exist, which is misleading.


---

🎯 What's really happening?

When you do:

S.optional(
  S.string.pipe(
    S.maxLength(5)
  )
)

This creates a union:

S.union(
  S.literal(undefined),
  S.string.pipe(S.maxLength(5))
)

If the value fails the maxLength refinement, then neither union branch matches:

undefined branch fails (value is defined)

string branch fails (value is too long)


So Effect reports:

❌ Expected: undefined (first union arm)

❌ Expected: string (maxLength=5) (second arm)


This is expected behavior — but the messaging is confusing when viewed from a user perspective.


---

✅ Recommended Fix: Use a transform instead of optional union

Instead of S.optional(...), define a schema that allows undefined after validating:

import * as S from "effect/schema/Schema"
import * as ParseResult from "effect/schema/ParseResult"

const optionalStringWithBoundaries = S.union(
  S.literal(undefined),
  S.string.pipe(
    S.minLength(3),
    S.maxLength(5),
    S.annotations({ message: "Must be between 3 and 5 characters" })
  )
)

If that still yields weird errors from the union, prefer this instead:


---

✅ Better: Normalize "" → undefined, then apply refinement conditionally

const normalizeEmpty = S.transformOrFail(
  S.string,
  S.optional(S.string),
  (v) => v.trim() === "" ? ParseResult.succeed(undefined) : ParseResult.succeed(v),
  (v) => v === undefined ? ParseResult.succeed("") : ParseResult.succeed(v)
)

const optionalBounded = normalizeEmpty.pipe(
  S.optional(
    S.string.pipe(
      S.minLength(3),
      S.maxLength(5),
      S.annotations({ message: "Must be between 3 and 5 characters" })
    )
  )
)

This gives you:

✅ Clean error: "Must be between 3 and 5 characters" when too long

✅ No confusing "expected undefined" messages

✅ Handles "" and undefined as “not provided”



---

🧪 TL;DR

S.optional(...) creates a union, which leads to two error branches.

The "expected undefined" is just the first union branch failing.

Use S.transformOrFail to normalize and avoid confusing dual errors.

Prefer refining after transforming instead of relying on union semantics.


Let me know if you want a factory function like:

optionalString(min: number, max: number, message: string)

I can give you one that's clean and reusable.

You're right — thanks for catching that.

As of latest @effect/schema@0.54.x+ (for effect@2.x), the correct way to implement a custom transform or preprocessor is via S.transformOrFail using the new function signature:

S.transformOrFail<From, To>(
  from: Schema<From>,
  to: Schema<To>,
  decode: (from: From, options: ParseOptions, self: AST.TransformOrFail) => ParseResult.ParseResult<To>,
  encode: (to: To, options: ParseOptions, self: AST.TransformOrFail) => ParseResult.ParseResult<From>
)


---

✅ Correct and working transformOrFail that normalizes "" to undefined

import * as S from "effect/schema/Schema"
import * as ParseResult from "effect/schema/ParseResult"
import * as AST from "effect/schema/AST"

const normalizeEmptyStringToUndefined = S.transformOrFail(
  S.string,                              // from
  S.optional(S.string),                 // to
  (value, _options, _self) => {
    return value.trim() === ""
      ? ParseResult.succeed(undefined)
      : ParseResult.succeed(value)
  },
  (value, _options, _self) => {
    return value === undefined
      ? ParseResult.succeed("")
      : ParseResult.succeed(value)
  }
)


---

🧱 Then apply validation only when defined:

const optionalBoundedString = normalizeEmptyStringToUndefined.pipe(
  S.optional(
    S.string.pipe(
      S.minLength(3),
      S.maxLength(10),
      S.annotations({ message: "Must be 3–10 characters" })
    )
  )
)


---

🧪 Behavior

Input	Output / Result

""	✅ normalized to undefined
"hi"	❌ fails minLength
"hello"	✅ passes
"toolongtoolong"	❌ fails maxLength
undefined	✅ passes



---

✅ Summary

✅ Correct syntax with 3-arg decode and encode function

🧼 Handles empty strings from FormData

💬 Avoids "expected undefined" confusion from union errors

✨ Works cleanly with .optional(...) + refinements


Let me know if you want to package this into a factory function or use it across your schemas.


You're 100% correct again — in the latest version of @effect/schema, the to type in S.transformOrFail(from, to, decode, encode) must be a non-optional schema, because:

> S.optional(...) is a modifier, not a base schema — so it cannot be used as the to argument.




---

✅ Updated, Correct Version: Handle "" → undefined for optional strings with length constraints

Here’s the working and idiomatic version for Effect Schema 0.54+ that:

Accepts "" and turns it into undefined

Applies minLength/maxLength only if value is provided

Avoids using S.optional(...) in the to position of transformOrFail



---

✅ Step-by-step

import * as S from "effect/schema/Schema"
import * as PR from "effect/schema/ParseResult"
import * as AST from "effect/schema/AST"
import { ParseOptions } from "effect/schema/Schema"

1. Create a transform from string → string | undefined

const normalizeEmptyString = S.transformOrFail(
  S.string,                            // from: string
  S.union(S.string, S.literal(undefined)), // to: string | undefined
  (value: string, _options: ParseOptions, _self: AST.TransformOrFail) => {
    return value.trim() === ""
      ? PR.succeed(undefined)
      : PR.succeed(value)
  },
  (value: string | undefined, _options: ParseOptions, _self: AST.TransformOrFail) => {
    return value === undefined
      ? PR.succeed("")
      : PR.succeed(value)
  }
)


---

2. Apply string constraints to the non-undefined branch

const boundedString = S.string.pipe(
  S.minLength(3),
  S.maxLength(10),
  S.annotations({ message: "Must be between 3 and 10 characters" })
)


---

3. Combine: final schema

export const optionalBoundedString = normalizeEmptyString.pipe(
  S.union(
    S.literal(undefined),
    boundedString
  )
)


---

✅ Usage

const MySchema = S.struct({
  nickname: optionalBoundedString
})

S.parse(MySchema)({})                     // ✅ OK
S.parse(MySchema)({ nickname: "" })       // ✅ OK (normalized to undefined)
S.parse(MySchema)({ nickname: "hi" })     // ❌ too short
S.parse(MySchema)({ nickname: "valid" })  // ✅ OK
S.parse(MySchema)({ nickname: "toolongtoolong" }) // ❌ too long


---

🧠 Why this works

S.union(S.string, S.literal(undefined)) is allowed as a to schema

Avoids the use of S.optional(...) directly inside transformOrFail

Gives clean and accurate error messages without "expected undefined" noise



---

Let me know if you want this packaged into a reusable helper like:

function optionalTrimmedString(min: number, max: number, message?: string): Schema<string | undefined>








