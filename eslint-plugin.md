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