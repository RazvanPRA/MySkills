type Graph = ReadonlyMap<string, readonly string[]>;

type Walk = {
  graph: Graph;
  state: Map<string, 'visiting' | 'done'>;
  path: string[];
  cycles: Map<string, string[]>;
};

function visit(node: string, walk: Walk): void {
  walk.state.set(node, 'visiting');
  walk.path.push(node);
  for (const next of walk.graph.get(node) ?? []) {
    const nextState = walk.state.get(next);
    if (nextState === 'visiting') {
      const cycle = walk.path.slice(walk.path.indexOf(next));
      walk.cycles.set([...cycle].sort().join('|'), cycle);
    } else if (nextState === undefined) {
      visit(next, walk);
    }
  }
  walk.path.pop();
  walk.state.set(node, 'done');
}

/**
 * Finds cycles in the prerequisite graph (topic id → prerequisite ids).
 * Each cycle is reported once, as the list of topic ids along it.
 */
export function findPrerequisiteCycles(graph: Graph): string[][] {
  const walk: Walk = { graph, state: new Map(), path: [], cycles: new Map() };
  for (const node of [...graph.keys()].sort()) {
    if (!walk.state.has(node)) {
      visit(node, walk);
    }
  }
  return [...walk.cycles.values()];
}
