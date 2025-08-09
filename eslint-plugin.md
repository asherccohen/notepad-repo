Here’s a condensed LLM-ready prompt that captures all your requirements and the context we’ve built so far, with enhanced details from the answers I gave:


---

Prompt:
I am building custom ESLint rules to help React developers adopt a state-machine and actor-model architecture for state management. I need clear, TypeScript-based ESLint rule implementations and configuration guidance.

The ESLint rules must enforce the following:

1. Encourage discriminated unions for state

When using useState, suggest using a discriminated union instead of primitive types (string, number, boolean).



2. Disallow direct setState calls in useEffect

Prevent updating state directly inside useEffect hooks to avoid implicit side effects.



3. Enforce event-driven state transitions

Require state transitions to be triggered only from event callbacks (e.g., handlers like handleClick), never from useEffect.

State transitions should be defined as events, and not all events must cause state changes (some can trigger side effects).



4. Allow extended/contextual state

Permit defining extended state as an object to hold contextual data necessary for the state machine (e.g., { count: number }).



5. Promote actor model structure

Structure state-machine logic as "actors" by moving it into its own custom hook (e.g., useCounterMachine), avoiding inline machine logic in components.




Integration requirements:

Provide an ESLint plugin structure with rules/ and index.ts.

Show how to register these rules in .eslintrc.

Suggest existing plugins that align with these goals (e.g., eslint-plugin-xstate, eslint-plugin-react-hooks).

For XState users, recommend relevant rules like no-inline-implementation, spawn-usage, and invoke-usage.

Ensure the rules work well with TypeScript's type-checking.


Output must include:

Full code examples for each rule using @typescript-eslint/utils.

Best practices for integrating with the React ecosystem.

Advice on combining custom rules with existing lint plugins for state machines and the actor model.



---

Do you want me to also expand this prompt into a combined “custom + existing ESLint rule integration plan” so an LLM can return a ready-to-use plugin in one go? That would make it executable without back-and-forth.



Sure! Here's a prompt you could give to an LLM to get the same detailed answer we built together:


---

Prompt:

I want to write a custom ESLint rule for a TypeScript React project to prevent unsafe usage of potentially undefined or null variables inside template literals or string concatenations. Specifically:

The rule should detect when a variable interpolated inside a template string or concatenated with a string can be undefined or null based on TypeScript types.

It should ignore safe cases, such as literals, constants initialized with literals, or expressions with explicit fallbacks like ??, ||, or ternary expressions with literal fallbacks.

The rule should also allow configuring ignored functions (e.g., console.log, logger.info) where this check is skipped.

When the rule finds an unsafe interpolation, it should report it and suggest an autofix to add a fallback like ?? 'unknown'.

The solution must rely on TypeScript's type checker through @typescript-eslint/utils and handle AST nodes accordingly.

Avoid using context.getScope() since it's not available in this environment; instead, use the TypeScript API to verify if an identifier is a constant literal.

Provide the full working ESLint rule code with correct usage of context.options and no context.getScope().

Include the handling of template literals and string concatenations (+ operator).

The rule should skip reporting if the expression already uses a fallback.

Show how to extract type information and check for possible null or undefined types using TypeScript's TypeFlags.


Please provide a complete ESLint rule implementation in TypeScript using @typescript-eslint/utils that meets these criteria, including comments explaining key parts.


---

That prompt captures your question, the improvements, and the final correct code approach we arrived at. Want me to help you polish it or generate tests for this?



Sure! Here's a prompt summary tailored for an LLM to answer your question about writing an ESLint rule enforcing React form components to have specific props, including fixers and advanced suggestions:


---

Prompt:

I want to write a custom ESLint rule for React projects that enforces the following:

When a React functional or class component renders a <form> element anywhere in its JSX, it must declare specific props, e.g., onSubmit and formId.

The rule should support:

Functional components with destructured props (e.g., ({ onSubmit, formId }) => ...)

Functional components with typed props (e.g., (props: Props) => ... or React.FC<Props>)

Class components extending React.Component<Props>


The rule should detect missing required props in the component's prop signature.

It should provide suggestions with auto-fixers:

For destructured props: automatically add missing props to the destructuring pattern.

For typed props (including class components): suggest manually extending a shared type alias like FormComponentProps that defines required props (because auto-fixing type declarations across files isn’t safe).


The rule should use TypeScript parser services and type checking for accurate detection.

Ideally, it should encourage standardization by suggesting the use of a shared type, e.g.:


type FormComponentProps = {
  onSubmit: (e: React.FormEvent) => void
  formId: string
}

The fixer should insert missing prop names into destructured function parameters and provide manual suggestions for extending types for typed/class components.


---

Would you please provide a complete ESLint rule implementation that covers these cases, including proper metadata (hasSuggestions: true), reporting, and fixer logic? Also include comments on limitations of auto-fixing typed props and suggestions for manual fixes.


---

If you want, also include ideas for improving the developer experience, such as detecting and suggesting extending shared prop types, or more advanced fixes.


---

This prompt captures the full scope of our conversation and the technical details you need. Want me to help turn this into a ready-to-use ESLint plugin package next?



// no-render-prefix.js

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow variables prefixed with "render"',
    },
    messages: {
      avoidRenderPrefix: 'Avoid using variables prefixed with "render".',
    },
    schema: [],
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        const name = node.id.name;
        if (name && /^render[A-Z]/.test(name)) {
          context.report({
            node: node.id,
            messageId: 'avoidRenderPrefix',
          });
        }
      },
    };
  },
};

// eslint.config.js

import noRenderPrefix from './no-render-prefix.js';

export default [
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      custom: {
        rules: {
          'no-render-prefix': noRenderPrefix,
        },
      },
    },
    rules: {
      'custom/no-render-prefix': 'error',
    },
  },
];


1. Suggest Discriminated Unions Instead of Primitive Types in useState

Objective: Encourage the use of discriminated unions for state management over primitive types.

Implementation:

// eslint-plugin-state-machine/rules/prefer-discriminated-union.ts

import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils";

export default createRule({
  name: "prefer-discriminated-union",
  meta: {
    type: "suggestion",
    docs: {
      description: "Suggest using discriminated unions instead of primitive types in useState.",
      recommended: "warn",
    },
    messages: {
      useDiscriminatedUnion: "Consider using a discriminated union for state instead of a primitive type.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "useState" &&
          node.typeParameters &&
          node.typeParameters.params.length === 1
        ) {
          const typeParam = node.typeParameters.params[0];
          if (
            typeParam.type === "TSTypeReference" &&
            typeParam.typeName.type === "Identifier" &&
            ["string", "number", "boolean"].includes(typeParam.typeName.name)
          ) {
            context.report({
              node,
              messageId: "useDiscriminatedUnion",
            });
          }
        }
      },
    };
  },
});


---

2. Disallow setState Calls Inside useEffect

Objective: Prevent direct state updates within useEffect to avoid unintended side effects.

Implementation:

// eslint-plugin-state-machine/rules/no-setstate-in-useeffect.ts

import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils";

export default createRule({
  name: "no-setstate-in-useeffect",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow calling setState inside useEffect.",
      recommended: "error",
    },
    messages: {
      noSetStateInUseEffect: "Avoid calling setState inside useEffect.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let inUseEffect = false;

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "useEffect"
        ) {
          inUseEffect = true;
        } else if (
          inUseEffect &&
          node.callee.type === "Identifier" &&
          node.callee.name.startsWith("set")
        ) {
          context.report({
            node,
            messageId: "noSetStateInUseEffect",
          });
        }
      },
      "CallExpression:exit"(node: TSESTree.CallExpression) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "useEffect"
        ) {
          inUseEffect = false;
        }
      },
    };
  },
});


---

3. Enforce Event-Driven State Transitions

Objective: Ensure state transitions are defined as events and invoked only within event callbacks.

Implementation:

// eslint-plugin-state-machine/rules/enforce-event-driven-transitions.ts

import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils";

export default createRule({
  name: "enforce-event-driven-transitions",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce state transitions to be event-driven and called only within event callbacks.",
      recommended: "error",
    },
    messages: {
      noTransitionOutsideEvent: "State transitions should only be called within event callbacks.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let inEventCallback = false;

    return {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        if (
          node.id &&
          node.id.name.startsWith("handle") // Assuming event handlers are named like handleClick, handleSubmit, etc.
        ) {
          inEventCallback = true;
        }
      },
      CallExpression(node: TSESTree.CallExpression) {
        if (
          !inEventCallback &&
          node.callee.type === "Identifier" &&
          node.callee.name.startsWith("transition") // Assuming transition functions are named like transitionToX
        ) {
          context.report({
            node,
            messageId: "noTransitionOutsideEvent",
          });
        }
      },
      "FunctionDeclaration:exit"(node: TSESTree.FunctionDeclaration) {
        if (
          node.id &&
          node.id.name.startsWith("handle")
        ) {
          inEventCallback = false;
        }
      },
    };
  },
});


---

4. Encourage Use of Custom Hooks for State Machine Logic

Objective: Promote encapsulation of state machine logic within custom hooks.

Implementation:

// eslint-plugin-state-machine/rules/use-custom-hook-for-state-machine.ts

import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils";

export default createRule({
  name: "use-custom-hook-for-state-machine",
  meta: {
    type: "suggestion",
    docs: {
      description: "Encourage encapsulating state machine logic within custom hooks.",
      recommended: "warn",
    },
    messages: {
      useCustomHook: "Consider moving state machine logic into a custom hook.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        if (
          node.id &&
          node.id.name.startsWith("use") &&
          node.body.body.some(
            (statement) =>
              statement.type === "VariableDeclaration" &&
              statement.declarations.some(
                (decl) =>
                  decl.id.type === "Identifier" &&
                  decl.id.name === "stateMachine"
              )
          )
        ) {
          context.report({
            node,
            messageId: "useCustomHook",
          });
        }
      },
    };
  },
});


---

5. Allow Extended State as Contextual Objects

Objective: Permit the definition of extended state (contextual state) as objects to support state machine functionality.

Implementation:

This rule is more about allowing a pattern rather than enforcing or disallowing it. Therefore, no specific ESLint rule is necessary unless you want to enforce the use of objects for extended state. If so, you can create a rule similar to the first one but in reverse, warning when primitive types are used for extended state.

// no undefined in string
Here's the updated ESLint rule with full support for fix suggestions, so it:

Detects possibly undefined | null values in string interpolation and concatenation

Suggests a safe fallback using ?? 'unknown'

Works inside template literals and + string concatenation

Allows ignoring specific function calls like console.log(...)



---

✅ Final no-unsafe-interpolation.ts Rule (with suggestions)

import { TSESTree, ESLintUtils } from '@typescript-eslint/utils';
import ts from 'typescript';

type Options = [{
  ignoreFunctions?: string[];
}];

type MessageIds = 'possiblyUndefinedInString';

const createRule = ESLintUtils.RuleCreator(() => 'https://your-docs/rules/no-unsafe-interpolation');

export default createRule<Options, MessageIds>({
  name: 'no-unsafe-interpolation',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow possibly undefined or null variables in template literals or string concatenation',
      recommended: 'warn',
    },
    schema: [{
      type: 'object',
      properties: {
        ignoreFunctions: {
          type: 'array',
          items: { type: 'string' },
          default: [],
        },
      },
    }],
    messages: {
      possiblyUndefinedInString: 'Variable `{{name}}` might be undefined or null in a string context.',
    },
    hasSuggestions: true,
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const parserServices = ESLintUtils.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();
    const ignoredFunctions = new Set(options.ignoreFunctions || []);

    function isPossiblyNullOrUndefined(type: ts.Type): boolean {
      if (type.getFlags() & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) return true;
      if (type.isUnion()) {
        return type.types.some(t => t.getFlags() & (ts.TypeFlags.Null | ts.TypeFlags.Undefined));
      }
      return false;
    }

    function isInIgnoredFunction(node: TSESTree.Node): boolean {
      let current: TSESTree.Node | undefined = node;
      while (current) {
        if (
          current.type === 'CallExpression' &&
          current.callee.type === 'MemberExpression' &&
          current.callee.object.type === 'Identifier' &&
          current.callee.property.type === 'Identifier'
        ) {
          const fullName = `${current.callee.object.name}.${current.callee.property.name}`;
          if (ignoredFunctions.has(fullName)) return true;
        }
        current = current.parent;
      }
      return false;
    }

    function checkExpression(expr: TSESTree.Expression) {
  if (isInIgnoredFunction(expr)) return;

  if (expr.type === 'Literal') return;

  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(expr);
  const type = typeChecker.getApparentType(typeChecker.getTypeAtLocation(tsNode));

  if (!isPossiblyNullOrUndefined(type)) return;

  const sourceCode = context.getSourceCode();
  const originalText = sourceCode.getText(expr);

  context.report({
    node: expr,
    messageId: 'possiblyUndefinedInString',
    data: { name: originalText },
    suggest: [
      {
        desc: `Wrap with fallback: \`${originalText} ?? 'unknown'\``,
        fix(fixer) {
          return fixer.replaceText(expr, `${originalText} ?? 'unknown'`);
        },
      },
    ],
  });
}

    return {
      TemplateLiteral(node) {
        for (const expr of node.expressions) {
          checkExpression(expr);
        }
      },
      BinaryExpression(node) {
        if (
          node.operator === '+' &&
          (node.left.type === 'Literal' || node.right.type === 'Literal')
        ) {
          checkExpression(node.left);
          checkExpression(node.right);
        }
      },
    };
  },
});


---

👀 Example in Action

❌ Code That Triggers Warning

let email: string | undefined;
const message = `Your email is ${email}`;

// ⚠️ Warning:
// Variable `email` might be undefined or null in a string context.
// 💡 Suggestion: email ?? 'unknown'

✅ After Accepting Suggestion

const message = `Your email is ${email ?? 'unknown'}`;


---

🧩 ESLint Config Usage

.eslintrc.js

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['your-plugin'],
  rules: {
    'your-plugin/no-unsafe-interpolation': ['warn', {
      ignoreFunctions: ['console.log', 'logger.info'],
    }],
  },
};


---

✅ Setup Checklist

To make this rule work in your project:

1. Ensure you're using @typescript-eslint/parser in ESLint config


2. Add this rule to a local plugin or use eslint-plugin-local


3. Add the rule to .eslintrc.js


4. Run ESLint with --fix or use an editor that supports in-place suggestions




---

Want me to help generate a plugin boilerplate (eslint-plugin-myteam) or show how to load this rule locally in a monorepo?


```
import { TSESTree, ESLintUtils } from '@typescript-eslint/utils';
import ts from 'typescript';

type Options = [{
  ignoreFunctions?: string[];
}];

type MessageIds = 'possiblyUndefinedInString';

const createRule = ESLintUtils.RuleCreator(() => 'https://your-docs/rules/no-unsafe-interpolation');

export default createRule<Options, MessageIds>({
  name: 'no-unsafe-interpolation',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow possibly undefined or null variables in template literals or string concatenation',
      recommended: 'warn',
    },
    schema: [{
      type: 'object',
      properties: {
        ignoreFunctions: {
          type: 'array',
          items: { type: 'string' },
          default: [],
        },
      },
    }],
    messages: {
      possiblyUndefinedInString: 'Variable `{{name}}` might be undefined or null in a string context.',
    },
    hasSuggestions: true,
  },
  defaultOptions: [{}],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();
    const options = context.options?.[0] || {};
    const ignoredFunctions = new Set(options.ignoreFunctions || []);
    const sourceCode = context.getSourceCode();

    function isPossiblyNullOrUndefined(type: ts.Type): boolean {
      const flags = ts.TypeFlags.Null | ts.TypeFlags.Undefined;
      if (type.getFlags() & flags) return true;
      if (type.isUnion()) {
        return type.types.some(t => t.getFlags() & flags);
      }
      return false;
    }

    function isInIgnoredFunction(node: TSESTree.Node): boolean {
      let current: TSESTree.Node | undefined = node;
      while (current) {
        if (
          current.type === 'CallExpression' &&
          current.callee.type === 'MemberExpression' &&
          current.callee.object.type === 'Identifier' &&
          current.callee.property.type === 'Identifier'
        ) {
          const fullName = `${current.callee.object.name}.${current.callee.property.name}`;
          if (ignoredFunctions.has(fullName)) return true;
        }
        current = current.parent;
      }
      return false;
    }

    function isConstAndLiteral(tsNode: ts.Node): boolean {
      if (!ts.isIdentifier(tsNode)) return false;
      const symbol = typeChecker.getSymbolAtLocation(tsNode);
      if (!symbol || !symbol.declarations?.length) return false;

      for (const decl of symbol.declarations) {
        if (
          ts.isVariableDeclaration(decl) &&
          decl.initializer &&
          (ts.isStringLiteral(decl.initializer) || ts.isNumericLiteral(decl.initializer)) &&
          decl.parent &&
          ts.isVariableDeclarationList(decl.parent) &&
          (decl.parent.flags & ts.NodeFlags.Const)
        ) {
          return true;
        }
      }

      return false;
    }

    function checkExpression(expr: TSESTree.Expression) {
      if (isInIgnoredFunction(expr)) return;
      if (expr.type === 'Literal') return;

      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(expr);
      if (isConstAndLiteral(tsNode)) return;

      // Ignore fallback expressions: ??, ||, or ternary with fallback
      if (
        expr.type === 'LogicalExpression' &&
        (expr.operator === '??' || expr.operator === '||')
      ) return;

      if (
        expr.type === 'ConditionalExpression' &&
        expr.alternate.type === 'Literal'
      ) return;

      const type = typeChecker.getApparentType(typeChecker.getTypeAtLocation(tsNode));
      if (!isPossiblyNullOrUndefined(type)) return;

      const originalText = sourceCode.getText(expr);

      context.report({
        node: expr,
        messageId: 'possiblyUndefinedInString',
        data: { name: originalText },
        suggest: [
          {
            desc: `Wrap with fallback: \`${originalText} ?? 'unknown'\``,
            fix(fixer) {
              return fixer.replaceText(expr, `${originalText} ?? 'unknown'`);
            },
          },
        ],
      });
    }

    return {
      TemplateLiteral(node) {
        for (const expr of node.expressions) {
          checkExpression(expr);
        }
      },
      BinaryExpression(node) {
        if (
          node.operator === '+' &&
          (node.left.type === 'Literal' || node.right.type === 'Literal')
        ) {
          checkExpression(node.left);
          checkExpression(node.right);
        }
      },
    };
  },
});
```

--------

Here’s the full enhanced ESLint rule implementation, including:

✅ Detection of <form> inside React components

✅ Support for destructured and typed props

✅ Class component support

✅ Suggestions with fixers

🧠 "Go further": auto-suggest extension of shared form prop types (FormComponentProps) when external Props are used



---

🧱 Shared Assumptions

Create a shared type like this in your codebase:

// shared-types.ts
export type FormComponentProps = {
  onSubmit: (e: React.FormEvent) => void
  formId: string
}

This rule will suggest using it if it sees:

type Props = {
  ...
}


---

✅ ESLint Rule

Here's the full rule file (form-props-required.ts):

```
import {
  TSESTree,
  TSESLint,
} from '@typescript-eslint/utils'
import ts from 'typescript'

type MessageIds = 'missingFormProps' | 'addPropsSuggestion' | 'extendPropsSuggestion'

const REQUIRED_PROPS = ['onSubmit', 'formId']

const rule: TSESLint.RuleModule<MessageIds, []> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure components using <form> have onSubmit and formId props',
      recommended: false,
    },
    messages: {
      missingFormProps: 'Component with <form> must declare required props: onSubmit, formId',
      addPropsSuggestion: 'Add missing props to component parameters',
      extendPropsSuggestion: 'Extend shared FormComponentProps',
    },
    hasSuggestions: true,
    schema: [],
  },

  create(context) {
    const parserServices = context.parserServices
    const checker = parserServices?.program?.getTypeChecker?.()

    function getMissingProps(props: string[]) {
      return REQUIRED_PROPS.filter((r) => !props.includes(r))
    }

    function findFormJSX(body: TSESTree.BlockStatement | TSESTree.Expression | null): boolean {
      if (!body) return false
      const check = (node: TSESTree.Node): boolean => {
        if (node.type === 'JSXElement') {
          return node.openingElement.name.type === 'JSXIdentifier' &&
                 node.openingElement.name.name === 'form'
        }
        if (node.type === 'JSXFragment') {
          return node.children.some(child =>
            child.type === 'JSXElement' && check(child)
          )
        }
        return false
      }

      if (body.type === 'BlockStatement') {
        return body.body.some((stmt) =>
          stmt.type === 'ReturnStatement' &&
          stmt.argument &&
          check(stmt.argument)
        )
      }

      return check(body)
    }

    function checkDestructuredFunction(node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression) {
      const jsxFound = findFormJSX(node.body)
      if (!jsxFound) return

      const param = node.params[0]
      if (!param || param.type !== 'ObjectPattern') {
        context.report({ node, messageId: 'missingFormProps' })
        return
      }

      const props = param.properties
        .filter((p): p is TSESTree.Property =>
          p.type === 'Property' && p.key.type === 'Identifier'
        )
        .map((p) => (p.key as TSESTree.Identifier).name)

      const missing = getMissingProps(props)
      if (missing.length === 0) return

      context.report({
        node,
        messageId: 'missingFormProps',
        suggest: [
          {
            messageId: 'addPropsSuggestion',
            fix(fixer) {
              const source = context.getSourceCode()
              const lastProp = param.properties[param.properties.length - 1]
              const insertText = props.length ? `, ${missing.join(', ')}` : missing.join(', ')
              return fixer.insertTextAfter(lastProp || param, insertText)
            },
          },
        ],
      })
    }

    function checkTypedFunction(node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression) {
      const jsxFound = findFormJSX(node.body)
      if (!jsxFound) return

      const param = node.params[0]
      if (!param || param.type !== 'Identifier' || !param.typeAnnotation) return

      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(param)
      const type = checker?.getTypeAtLocation(tsNode)
      if (!type) return

      const props = checker.getPropertiesOfType(type).map((s) => s.name)
      const missing = getMissingProps(props)
      if (missing.length === 0) return

      context.report({
        node,
        messageId: 'missingFormProps',
        suggest: [
          {
            messageId: 'extendPropsSuggestion',
            fix: (fixer) => null, // cannot auto-fix external types
          },
        ],
      })
    }

    function checkClassComponent(node: TSESTree.ClassDeclaration) {
      const renderMethod = node.body.body.find(
        (m): m is TSESTree.MethodDefinition =>
          m.type === 'MethodDefinition' && m.key.type === 'Identifier' && m.key.name === 'render'
      )
      if (!renderMethod || !renderMethod.value || renderMethod.value.type !== 'FunctionExpression') return

      const jsxFound = findFormJSX(renderMethod.value.body)
      if (!jsxFound) return

      const typeParam = node.superTypeParameters?.params[0]
      if (!typeParam) return

      context.report({
        node,
        messageId: 'missingFormProps',
        suggest: [
          {
            messageId: 'extendPropsSuggestion',
            fix: (fixer) => null,
          },
        ],
      })
    }

    return {
      FunctionDeclaration: (node) => {
        const param = node.params[0]
        if (!param) return
        if (param.type === 'ObjectPattern') {
          checkDestructuredFunction(node)
        } else if (param.type === 'Identifier' && param.typeAnnotation) {
          checkTypedFunction(node)
        }
      },
      ArrowFunctionExpression: (node) => {
        const param = node.params[0]
        if (!param) return
        if (param.type === 'ObjectPattern') {
          checkDestructuredFunction(node)
        } else if (param.type === 'Identifier' && param.typeAnnotation) {
          checkTypedFunction(node)
        }
      },
      ClassDeclaration: checkClassComponent,
    }
  },
}

export default rule

```
---

🧪 Example Suggestions

✅ Fix: Add Missing Props

// Before
const MyForm = ({}) => <form />

// Fix Suggestion:
const MyForm = ({ onSubmit, formId }) => <form />

💡 Suggest: Extend Props

type Props = {
  somethingElse: string
}

// Before
const MyForm = (props: Props) => <form />

// Suggest:
type Props = Base & FormComponentProps

> You can't auto-fix this safely, so we surface it as a manual suggestion.




---

🧰 Next Steps

If you want:

🔌 Plugin wrapper with index.ts and configs/recommended.ts

🧪 Tests using @typescript-eslint/rule-tester

🧪 Fixtures for class + function components


Let me know — I can scaffold the full plugin structure.



