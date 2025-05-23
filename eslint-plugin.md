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
