Here’s a condensed prompt version of our conversation, with your question and the relevant details already baked in:


---

Prompt:
I’m using TypeScript with Zod in my project. I want to know if there is a way to validate data using an existing JSON Schema instead of rewriting the schema in Zod.

If possible, explain:

Whether Zod supports JSON Schema validation natively.

How to convert a Zod schema to JSON Schema.

How to convert an existing JSON Schema into a Zod schema for runtime validation.

Any tools or libraries available for this conversion (CLI or programmatic).


Include known options such as:

Zod’s toJSONSchema() feature (available since Zod 4).

json-schema-to-zod (CLI/runtime converter from JSON Schema to Zod schema code).

@dmitryrechkin/json-schema-to-zod (TypeScript library for converting JSON Schema to Zod schemas at runtime).


Focus on solutions that integrate cleanly into a modern TypeScript stack (Node.js, React, Remix/Next.js).


---

Do you want me to also make you a version optimized for GitHub Copilot / Cursor AI so it would directly suggest the relevant code?



Got it. Here’s a detailed prompt incorporating all key points from our discussion:


---

Prompt:

Is creating Zod or Effect schemas dynamically at runtime from JSON Schemas fetched over the network considered bad practice? Please provide a detailed explanation covering:

How this approach affects TypeScript’s type safety and compile-time type inference, given that runtime-generated schemas cannot be statically typed.

The performance implications of parsing and compiling schemas at runtime, especially for large or frequently fetched schemas.

Challenges in error handling and debugging when the runtime JSON Schema is invalid or differs unexpectedly.

Impact on developer experience due to limited tooling support, like autocompletion and linting, when schemas are not defined statically.

Scenarios where runtime schema generation might be acceptable or necessary (e.g., dynamic form builders or adapting to external, dynamic APIs).

Recommended best practices, such as defining schemas at compile time or using code generation tools (e.g., json-schema-to-zod) to convert JSON Schemas into Zod/Effect schemas ahead of time.

Alternative libraries optimized for runtime JSON Schema validation (e.g., ajv) and when to prefer them.


Please answer with a focus on practical implications in a TypeScript project using Zod or Effect for validation.


---

Want me to help build a specific example or code snippet for any of these approaches?



I understand your situation—you need to balance the flexibility of validating data with JSON Schemas fetched at runtime while also leveraging Zod or Effect schemas for TypeScript type safety. Let’s break this down and address your approach of wrapping the schema definition in a function, calling it with fetched JSON Schema values, and using ReturnType to extract types. We’ll also evaluate whether this is a "problem" in light of Colin Hicks’ (
@colinhacks
) concerns and explore how to make it work effectively.
Understanding Your Approach
From your description and the X thread, here’s what I gather about your setup:
Dual Validation Requirement:
You need to validate data against JSON Schemas, which are fetched over the network at runtime. These JSON Schemas might contain properties like minLength, pattern, etc., that define validation rules.
You also want to use Zod or Effect schemas to ensure TypeScript type safety and benefit from their type inference capabilities.
Wrapping Schema in a Function:
Instead of creating the Zod/Effect schema directly from the JSON Schema at runtime (which could be risky and slow), you’re wrapping the schema definition in a function. This function takes the fetched JSON Schema properties (e.g., minLength, pattern) as parameters and constructs a Zod/Effect schema dynamically.
For example, your setup might look something like this:
typescript
import { z } from "zod";

// Function that takes JSON Schema properties and returns a Zod schema
const createSchema = (jsonSchemaProps: { minLength?: number; pattern?: string }) => {
  return z.string().min(jsonSchemaProps.minLength ?? 0).regex(new RegExp(jsonSchemaProps.pattern ?? ".*"));
};

// At runtime, fetch JSON Schema and use it to create the Zod schema
const fetchAndCreateSchema = async () => {
  const jsonSchema = await fetchJsonSchema(); // Fetched: { minLength: 5, pattern: "^[a-z]+$" }
  return createSchema(jsonSchema);
};
Using ReturnType for Types:
You’re using TypeScript’s ReturnType utility to extract the type of the schema for type safety. Continuing the example:
typescript
type DynamicSchema = ReturnType<typeof createSchema>;
type InferredType = z.infer<DynamicSchema>;
This allows you to get the inferred type of the Zod schema (e.g., string in this case) and use it in your TypeScript code.
Your Perspective:
You don’t see wrapping the schema in a function and using fetched values as a problem because it avoids directly constructing the schema from raw JSON Schema at runtime, which could introduce security risks or performance issues.
Addressing Colin Hicks’ Concern
Colin Hicks called the pattern of "creating schemas at runtime from JSONSchemas fetched over the network" a "weird pattern" and suggested using TypeCompiler from TypeBox instead. Let’s break down why he might have flagged this as a concern and how your clarification (wrapping in a function) mitigates some of those issues:
Original Concern with Runtime Schema Creation:
If you were directly parsing a JSON Schema fetched over the network and converting it into a Zod/Effect schema at runtime (e.g., by dynamically mapping JSON Schema properties to Zod methods), there would be several risks:
Security: A maliciously crafted JSON Schema could lead to unexpected behavior, such as overly permissive validation or even code injection if the schema parsing logic isn’t secure.
Performance: Parsing and constructing a schema on every request is computationally expensive, especially if the schema is complex or the network fetch is slow.
Type Safety: TypeScript wouldn’t be able to infer types until runtime, making it harder to catch type errors during development.
How Your Approach Mitigates This:
By wrapping the schema definition in a function (createSchema), you’re not dynamically parsing the JSON Schema into a Zod schema in an uncontrolled way. Instead, you’re using specific, known properties (e.g., minLength, pattern) to configure a predefined Zod schema structure.
This reduces the security risk because the schema structure is hardcoded in your function—you’re not evaluating arbitrary JSON Schema logic. For example, you’re not allowing the JSON Schema to dictate whether the schema should be a z.string() or a z.object(); that’s fixed in your code.
It also improves performance slightly because you’re not repeatedly parsing the entire JSON Schema into a new Zod schema—you’re just passing parameters to a predefined function.
Remaining Concerns:
While your approach mitigates some risks, there are still potential issues that align with Hicks’ caution:
Dynamic Nature of Fetched Values: The fetched JSON Schema properties (e.g., minLength, pattern) could still be malformed or malicious. For example, if pattern contains an invalid regex, it could throw an error when creating the RegExp object, or worse, cause unexpected behavior during validation.
Type Inference Challenges: Using ReturnType to extract the type of the schema is a good start, but the type might not fully reflect the runtime constraints. For example, z.infer will only give you the base type (string in the example), but it won’t encode the runtime constraints like minLength or pattern into the TypeScript type system. This means you might still encounter runtime errors that TypeScript can’t catch.
Network Dependency: Your schema creation still depends on a network fetch, which introduces latency and potential failure points (e.g., what happens if the fetch fails or the schema isn’t available?).
Is Your Approach a Problem?
Your approach isn’t inherently a "problem," but it does have trade-offs that you should be aware of. Let’s evaluate it in the context of best practices for TypeScript and schema validation:
Pros of Your Approach
Controlled Schema Construction:
By wrapping the schema in a function, you maintain control over the structure of the Zod/Effect schema. This reduces the risk of arbitrary schema generation and makes the validation logic more predictable.
Type Safety with ReturnType:
Using ReturnType and z.infer allows you to extract types from the dynamically created schema, giving you some level of type safety in TypeScript. This is a reasonable way to bridge the gap between runtime validation and static typing.
Flexibility:
Your approach allows you to use runtime-fetched JSON Schema properties while still benefiting from Zod/Effect’s validation and type inference capabilities. This is useful if your system requires dynamic validation rules that can’t be hardcoded.
Cons of Your Approach
Runtime Errors from Fetched Values:
If the fetched JSON Schema contains invalid or malicious values (e.g., an invalid pattern or a negative minLength), your schema creation could fail at runtime. You’ll need to add robust error handling to sanitize and validate the fetched values before passing them to createSchema.
Limited Type Precision:
While z.infer gives you the base type, it doesn’t encode the runtime constraints into the TypeScript type system. For example, a z.string().min(5) schema infers as string, not as a string with a minimum length of 5. This means TypeScript won’t catch violations of those constraints at compile time—you’ll only catch them at runtime when validation fails.
Network Dependency:
The reliance on fetching the JSON Schema at runtime introduces latency and potential failure points. If the fetch fails, you’ll need a fallback mechanism to ensure your application doesn’t break.
Scalability:
If your JSON Schemas become more complex (e.g., nested objects, arrays, or unions), mapping their properties to Zod/Effect schemas in a function might become cumbersome and error-prone. You’ll need to carefully handle all possible JSON Schema constructs.
Recommendations to Improve Your Approach
To make your approach more robust while still meeting your requirements for both JSON Schema validation and Zod/Effect type safety, here are some suggestions:
Validate the Fetched JSON Schema Properties:
Before passing the fetched JSON Schema properties to your createSchema function, validate them using a separate schema (e.g., a Zod schema for the expected JSON Schema properties). This ensures that the values are safe and valid.
Example:
typescript
const JsonSchemaPropsSchema = z.object({
  minLength: z.number().int().nonnegative().optional(),
  pattern: z.string().optional(),
});

const fetchAndCreateSchema = async () => {
  const jsonSchema = await fetchJsonSchema(); // Fetched: { minLength: 5, pattern: "^[a-z]+$" }
  const parsedProps = JsonSchemaPropsSchema.parse(jsonSchema); // Validate the fetched props
  return createSchema(parsedProps);
};
This ensures that minLength is a non-negative integer and pattern is a string, preventing runtime errors when constructing the Zod schema.
Add Fallbacks for Network Failures:
If the fetch fails, you should have a default schema or a cached version of the JSON Schema to fall back on. This ensures your application remains functional even if the network is unavailable.
Example:
typescript
const defaultProps = { minLength: 0, pattern: ".*" };
const fetchAndCreateSchema = async () => {
  try {
    const jsonSchema = await fetchJsonSchema();
    const parsedProps = JsonSchemaPropsSchema.parse(jsonSchema);
    return createSchema(parsedProps);
  } catch (error) {
    console.error("Failed to fetch schema, using default:", error);
    return createSchema(defaultProps);
  }
};
Improve Type Safety with Branded Types:
Since z.infer doesn’t encode runtime constraints like minLength into the type system, you can use branded types (or TypeScript’s template literal types for regex patterns) to add more precision to your types.
Example using branded types with Zod:
typescript
const createSchema = (jsonSchemaProps: { minLength?: number; pattern?: string }) => {
  const schema = z
    .string()
    .min(jsonSchemaProps.minLength ?? 0)
    .regex(new RegExp(jsonSchemaProps.pattern ?? ".*"))
    .brand<"DynamicString">(); // Add a brand to the type
  return schema;
};

type DynamicString = z.infer<ReturnType<typeof createSchema>>;
const isDynamicString = (value: unknown): value is DynamicString => {
  const schema = createSchema({ minLength: 5, pattern: "^[a-z]+$" });
  return schema.safeParse(value).success;
};
This gives you a branded type (DynamicString) that you can use to distinguish validated strings from regular strings, adding an extra layer of type safety.
Combine JSON Schema and Zod Validation:
Since you need both JSON Schema and Zod validation, you can run them in sequence:
First, validate the data against the fetched JSON Schema using a JSON Schema validator like Ajv or TypeBox.
Then, pass the validated data to your Zod schema for additional type-safe validation and type inference.
Example:
typescript
import Ajv from "ajv";
const ajv = new Ajv();

const fetchAndValidate = async (data: unknown) => {
  // Step 1: Validate with JSON Schema
  const jsonSchema = await fetchJsonSchema();
  const validateJsonSchema = ajv.compile(jsonSchema);
  if (!validateJsonSchema(data)) {
    throw new Error("JSON Schema validation failed: " + JSON.stringify(validateJsonSchema.errors));
  }

  // Step 2: Validate with Zod for type safety
  const zodSchema = createSchema(jsonSchema);
  return zodSchema.parse(data); // Type: string (or branded type)
};
This ensures that you’re meeting both requirements: JSON Schema validation for compatibility with external systems, and Zod validation for TypeScript type safety.
Consider Caching the Schema:
To reduce the performance impact of fetching the JSON Schema on every request, you can cache the fetched schema (or the compiled Zod schema) in memory or in a persistent store.
Example:
typescript
let cachedSchema: z.ZodType | null = null;

const fetchAndCreateSchema = async () => {
  if (cachedSchema) return cachedSchema;
  const jsonSchema = await fetchJsonSchema();
  const parsedProps = JsonSchemaPropsSchema.parse(jsonSchema);
  cachedSchema = createSchema(parsedProps);
  return cachedSchema;
};
Why Hicks Still Might Call This a "Weird Pattern"
Even with your clarification, Hicks might still consider this a "weird pattern" because:
Dynamic Validation Rules: Any approach that relies on runtime-fetched values to define validation rules introduces some level of unpredictability, which can be at odds with TypeScript’s goal of catching errors at compile time.
Separation of Concerns: Ideally, schema definitions should be static and defined at build time to maximize type safety and performance. Your approach, while controlled, still mixes runtime data (fetched JSON Schema) with schema construction, which can make the system harder to reason about.
Alternative with TypeBox: Hicks suggested TypeCompiler from TypeBox because it allows you to define JSON Schema-compatible schemas at build time, compile them into efficient validators, and still get TypeScript type safety. If you could define your schemas statically (or at least cache them after the first fetch), you’d avoid many of the risks associated with runtime schema construction.
However, given your constraint that you can’t change the requirement to fetch JSON Schemas at runtime, your approach is a reasonable compromise. You’ve mitigated the biggest risks by wrapping the schema in a function, and with the additional safeguards I’ve suggested (validation, fallbacks, caching, etc.), you can make it even more robust.
Final Thoughts
Your approach of wrapping the schema definition in a function and using fetched JSON Schema values is not inherently a "problem," but it does come with trade-offs in terms of runtime safety, type precision, and performance. By adding validation for the fetched JSON Schema properties, using fallbacks, and combining JSON Schema and Zod validation, you can make your implementation more robust while still meeting your requirements.
If you have the flexibility to explore alternatives in the future, you might consider:
Using TypeBox’s TypeCompiler to define and compile JSON Schema-compatible schemas at build time, as Hicks suggested.
Fetching the JSON Schema only once (e.g., at application startup) and caching it to reduce runtime dependencies.
For now, your approach is a practical solution given your constraints, and with the recommended improvements, it should work well in your TypeScript environment.