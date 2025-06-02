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
  create(context, [options]) {
    const parserServices = ESLintUtils.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();
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

    function isConstLiteral(identifier: TSESTree.Identifier): boolean {
      const scope = context.getScope();
      const variable = scope.variables.find(v => v.name === identifier.name);
      if (!variable || variable.defs.length === 0) return false;
      const def = variable.defs[0];
      return def.node.type === 'VariableDeclarator' &&
        def.parent?.kind === 'const' &&
        def.node.init?.type === 'Literal';
    }

    function checkExpression(expr: TSESTree.Expression) {
      if (isInIgnoredFunction(expr)) return;
      if (expr.type === 'Literal') return;
      if (expr.type === 'Identifier' && isConstLiteral(expr)) return;

      // Ignore fallback expressions: ??, ||, or ternary
      if (
        expr.type === 'LogicalExpression' &&
        (expr.operator === '??' || expr.operator === '||')
      ) {
        return;
      }

      if (
        expr.type === 'ConditionalExpression' &&
        expr.alternate.type === 'Literal'
      ) {
        return;
      }

      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(expr);
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

