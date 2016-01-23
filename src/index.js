import util from 'util';

export default function treefy(node, doc, ctx, _stack) {
  let graph = doc['@graph'] || doc;
  ctx = ctx || doc['@context'];
  if (typeof ctx !== 'object') {
    throw new Error('Could not find a valid context. Context must be an object and cannot be a URL');
  }
  _stack = _stack || [];

  if (typeof node === 'string') {
    let match = graph.filter(n => n['@id'] === node)[0];
    if (match) {
      if (has(_stack, match['@id'])) {
        return match['@id'];
      } else {
        _stack.push(match['@id']);
        let framed = treefy(match, doc, ctx, _stack);
        _stack.pop();
        return framed;
      }
    } else {
      return node;
    }
  } else if (Array.isArray(node)) {
    return node.map(n => treefy(n, doc, ctx, _stack));
  } else {
    return Object.keys(node).reduce((tree, p) => {
      let value = node[p];
      if (p === '@id') {
        if (!value.startsWith('_:')){
          tree[p] = value;
        }
      } else if (typeof value === 'string' && p in ctx && ctx[p]['@type'] === '@id') {
        let match = graph.filter(n => n['@id'] === value)[0];
        if (match) {
          if (has(_stack, match['@id'])) {
            tree[p] = match['@id'];
          } else {
            _stack.push(match['@id']);
            tree[p] = treefy(match, doc, ctx, _stack);
            _stack.pop();
          }
        } else {
          tree[p] = value;
        }
      } else {
        tree[p] = treefy(value, doc, ctx, _stack);
      }

      return tree;
    }, {});
  }

  return done;
}


function has(stack, id) {
  for (let item of stack) {
    if (item === id) {
      return true;
    }
  }
  return false;
}
