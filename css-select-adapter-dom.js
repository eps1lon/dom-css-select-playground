const cssSelectAdapter = {
  isTag(node) {
    return node && node.nodeType === 1; // Node.ELEMENT_NODE
  },
  // does at least one of passed element nodes pass the test predicate?
  existsOne(test, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const checked = nodes[i];
      if (
        this.isTag(checked) &&
        (test(checked) || this.existsOne(test, this.getChildren(checked)))
      ) {
        return true;
      }
    }

    return false;
  },
  // css-select calls this without checking for isTag
  getAttributeValue(node, name) {
    if (!this.isTag(node)) {
      return undefined;
    }
    // lots of special casing for css-select not differentiating between attributes and properties
    return node.getAttributeNS(null, name);
  },
  getChildren(node) {
    return Array.from(node.childNodes);
  },
  // get the name of the tag
  getName(nodeOrElement) {
    if (this.isTag(nodeOrElement)) {
      return nodeOrElement.tagName.toLowerCase();
    }
    // TODO docs say this can only be an element but isn't
    // it seems like it's called with returnvalues from getParent
    // which can return nodes. Maybe getParent should return an element?
    return null;
  },
  // get the parent of the node
  getParent(node) {
    return node.parentNode;
  },
  /*
    get the siblings of the node. Note that unlike jQuery's `siblings` method,
    this is expected to include the current node as well
  */
  getSiblings(node) {
    if (node.parentNode) {
      return this.getChildren(node.parentNode);
    }
    return [];
  },
  // get the text content of the node, and its children if it has any
  getText(node) {
    return node.textContent;
  },
  // does the ~element~ node have the named attribute?
  hasAttrib(node, name) {
    if (!this.isTag(node)) {
      return false;
    }

    // special casing css-selects missing differentiation between attributes and properties
    // it uses hasAttribute for manually reflecting attributes
    const isBooleanAttribute =
      ["checked", "hidden", "selected"].indexOf(name) !== -1;
    const reflectsBooleanAttribute = node[name] !== undefined;
    if (isBooleanAttribute && reflectsBooleanAttribute) {
      return node[name];
    }
    return node.hasAttributeNS(null, name);
  },
  // TODO
  removeSubsets(nodes) {
    return nodes;
  },
  // finds all of the element nodes in the array that match the test predicate,
  // as well as any of their children that match it
  findAll(test, nodes) {
    const found = [];

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (!this.isTag(node)) {
        continue;
      }
      found.push(...this.findAll(test, this.getChildren(node)));
      if (test(node)) {
        found.push(node);
      }
    }
    return found;
  },

  // finds the first node in the array that matches the test predicate, or one
  // of its children
  findOne(test, elements) {
    let elem = null;

    for (let i = 0; i < elements.length && !elem; i++) {
      const checked = elements[i];
      if (!this.isTag(checked)) {
        continue;
      } else if (test(checked)) {
        elem = checked;
      } else if (checked.childNodes.length > 0) {
        elem = this.findOne(test, this.getChildren(checked));
      }
    }

    return elem;
  },

  /*
    The adapter can also optionally include an equals method, if your DOM
    structure needs a custom equality test to compare two objects which refer
    to the same underlying node. If not provided, `css-select` will fall back to
    `a === b`.
  */
  equals(a, b) {
    return a === b;
  }
};

module.exports = cssSelectAdapter;
