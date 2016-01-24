export default function embed(node, graph, _map, _stack) {
  graph = graph['@graph'] || graph;
  _stack = _stack || [];
  _map = _map || graph.reduce((_map, node) => {
    _map[node['@id']] = node;
    return _map;
  }, {});

  if (typeof node === 'string') {
    return embedMatch(node, graph, _map, _stack);
  } else if (Array.isArray(node)) {
    return node.map(n => embed(n, graph, _map, _stack));
  } else {
    let keys = Object.keys(node);
    if (keys.length === 1 && keys[0] === '@id') {
      return embedMatch(node, graph, _map, _stack);
    } else {
      return Object.keys(node).reduce((tree, p) => {
        let value = node[p];
        if (typeof value === 'string' && p in _map) {
          tree[p] = embedMatch(value, graph, _map, _stack);
        } else {
          tree[p] = embed(value, graph, _map, _stack);
        }
        return tree;
      }, {});
    }
  }
}

function embedMatch(value, graph, _map, _stack) {
  let key = value['@id'] || value;
  let match = ~key.indexOf(':') && _map[key]; // restrict keys to CURIE (this is fragile but better than nothing)
  if (match) {
    if (has(_stack, match['@id'])) {
      return value;
    } else {
      _stack.push(match['@id']);
      let framed = embed(match, graph, _map, _stack);
      _stack.pop();
      return framed;
    }
  } else {
    return value;
  }
}

function has(stack, id) {
  for (let item of stack) {
    if (item === id) {
      return true;
    }
  }
  return false;
}
