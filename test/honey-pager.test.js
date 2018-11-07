import './myconfig';
import database from './database';
import User from './User';
import first from 'lodash/first';
import last from 'lodash/last';

const fixtures = [
  { firstName: 'John', lastName: 'Doe', isAdmin: true, age: 31 },
  { firstName: 'Alana', lastName: 'Doe', isAdmin: false, age: 22 },
  { firstName: 'Jane', lastName: 'Doe', isAdmin: false, age: 28 },
  { firstName: 'Rosamond', lastName: 'Tanner', isAdmin: true, age: 25 },
  { firstName: 'Foo', lastName: 'Bar', isAdmin: false, age: 12 },
  { firstName: 'Anona', lastName: 'Ivor', isAdmin: true, age: 17 }
];

beforeAll(async () => {
  await database.connect();
  await User.remove();

  for (const fixture of fixtures) {
    await new User(fixture).save();
  }
});

afterAll(async () => {
  await database.disconnect();
});

test('Testing config persistence', async () => {
  expect(require('..').config.get().cursorSecret).toBe('mySecret');
  expect(() => {
    require('..').config.update({
      cursorSecret: 'aNewSecret',
      methodName: 'aNewMethodName'
    })
  }).toThrow('HoneyPager config cannot be updated after it has been got.');
});

test('Testing vanilla', async () => {
  const v = await User.paginateResult();
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(fixtures.length);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing first and last (should throw)', async () => {
  await expect(User.paginateResult({}, {
    first: 5,
    last: 5
  })).rejects.toThrow('first and last cannot be set at the same time.');
});

test('Testing first', async () => {
  const v = await User.paginateResult({}, {
    first: 3
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(3);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[2].lastName);
});

test('Testing last', async () => {
  const v = await User.paginateResult({}, {
    last: 3
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(3);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[3].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing after', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    after: s.pageInfo.startCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(fixtures.length - 1);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[1].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing first/after with first < max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    first: 2,
    after: s.pageInfo.startCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[1].lastName);
  expect(last(v.edges).node.lastName === fixtures[2].lastName);
});

test('Testing first/after with first == max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    first: 5,
    after: s.pageInfo.startCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(5);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[1].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing first/after with first > max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    first: 10,
    after: s.pageInfo.startCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(fixtures.length - 1);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[1].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing before', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    before: s.pageInfo.endCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(fixtures.length - 1);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 2].lastName);
});

test('Testing last/before with last < max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    last: 2,
    before: s.pageInfo.endCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[fixtures.length - 3].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 2].lastName);
});

test('Testing last/before with last == max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    last: 5,
    before: s.pageInfo.endCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(fixtures.length - 1);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 2].lastName);
});

test('Testing last/before with last > max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    last: 10,
    before: s.pageInfo.endCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(fixtures.length - 1);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 2].lastName);
});

test('Testing wrong cursors', async () => {
  const v = await User.paginateResult({}, {});
  const wrongAfterCursor = `${v.pageInfo.startCursor}toto`;
  const wrongBeforeCursor = `${v.pageInfo.endCursor}tata`;
  await expect(User.paginateResult({}, {
    after: wrongAfterCursor
  })).rejects.toThrow('Invalid cursor');
  await expect(User.paginateResult({}, {
    before: wrongBeforeCursor
  })).rejects.toThrow('Invalid cursor');
});

test('Testing first/before with first < max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    first: 2,
    before: s.pageInfo.endCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[1].lastName);
});

test('Testing first/before with first == max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    first: 5,
    before: s.pageInfo.endCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(5);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 2].lastName);
});

test('Testing first/before with first > max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    first: 10,
    before: s.pageInfo.endCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(5);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing last/after with first < max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    last: 2,
    after: s.pageInfo.startCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[fixtures.length - 2].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing last/after with first == max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    last: 5,
    after: s.pageInfo.startCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(5);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[1].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing last/after with first > max', async () => {
  const s = await User.paginateResult({});
  const v = await User.paginateResult({}, {
    last: 10,
    after: s.pageInfo.startCursor
  });
  expect(v.totalCount).toBe(fixtures.length);
  expect(v.edges.length).toBe(5);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[1].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing search', async () => {
  const v = await User.paginateResult({}, {
    search: "Doe"
  }, {
    searchFields: ["firstName", "lastName"]
  });

  expect(v.totalCount).toBe(3);
  expect(v.edges.length).toBe(3);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[2].lastName);
});

test('Testing search with first', async () => {
  const v = await User.paginateResult({}, {
    search: "Doe",
    first: 2
  }, {
    searchFields: ["firstName", "lastName"]
  });

  expect(v.totalCount).toBe(3);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);
  expect(first(v.edges).node.lastName === fixtures[0].lastName);
  expect(last(v.edges).node.lastName === fixtures[1].lastName);
});

test('Testing search with last', async () => {
  const v = await User.paginateResult({}, {
    search: "Doe",
    last: 2
  }, {
    searchFields: ["firstName", "lastName"]
  });

  expect(v.totalCount).toBe(3);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
  expect(first(v.edges).node.lastName === fixtures[fixtures.length - 2].lastName);
  expect(last(v.edges).node.lastName === fixtures[fixtures.length - 1].lastName);
});

test('Testing sort without order', async () => {
  const v = await User.paginateResult({}, {
    sort: {
      by: "lastName"
    }
  });

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(6);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(false);

  const source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort asc', async () => {
  const v = await User.paginateResult({}, {
    sort: {
      by: "lastName",
      order: "asc"
    }
  });

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(6);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(false);

  const source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort desc', async () => {
  const v = await User.paginateResult({}, {
    sort: {
      by: "lastName",
      order: "desc"
    }
  });

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(6);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(false);

  const source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a < b);
  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort without order using first', async () => {
  const v = await User.paginateResult({}, {
    first: 2,
    sort: {
      by: "lastName"
    }
  });

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  source = source.slice(0, 2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort asc using first', async () => {
  const v = await User.paginateResult({}, {
    first: 2,
    sort: {
      by: "lastName",
      order: "asc"
    }
  });

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  source = source.slice(0, 2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort desc using first', async () => {
  const v = await User.paginateResult({}, {
    first: 2,
    sort: {
      by: "lastName",
      order: "desc"
    }
  });

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a < b);
  source = source.slice(0, 2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort without order using last', async () => {
  const v = await User.paginateResult({}, {
    last: 2,
    sort: {
      by: "lastName"
    }
  });

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  source = source.slice(source.length - 2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort asc using last', async () => {
  const v = await User.paginateResult({}, {
    last: 2,
    sort: {
      by: "lastName",
      order: "asc"
    }
  });

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  source = source.slice(source.length - 2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort desc using last', async () => {
  const v = await User.paginateResult({}, {
    last: 2,
    sort: {
      by: "lastName",
      order: "desc"
    }
  });

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(2);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a < b);
  source = source.slice(source.length - 2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort without order using after', async () => {
  const args = {
    sort: {
      by: "lastName"
    }
  };

  const opts = {};

  const s = await User.paginateResult({}, args, opts);
  const v = await User.paginateResult({}, {
    ...args,
    after: s.edges[1].cursor
  }, opts);

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(4);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  source = source.slice(2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort asc using after', async () => {
  const args = {
    sort: {
      by: "lastName",
      order: "asc"
    }
  };

  const opts = {};

  const s = await User.paginateResult({}, args, opts);
  const v = await User.paginateResult({}, {
    ...args,
    after: s.edges[1].cursor
  }, opts);

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(4);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  source = source.slice(2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort desc using after', async () => {
  const args = {
    sort: {
      by: "lastName",
      order: "desc"
    }
  };

  const opts = {};

  const s = await User.paginateResult({}, args, opts);
  const v = await User.paginateResult({}, {
    ...args,
    after: s.edges[1].cursor
  }, opts);

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(4);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a < b);
  source = source.slice(2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

// SORT + BEFORE
test('Testing sort without order using before', async () => {
  const args = {
    sort: {
      by: "lastName"
    }
  };

  const opts = {};

  const s = await User.paginateResult({}, args, opts);
  const v = await User.paginateResult({}, {
    ...args,
    before: s.edges[s.edges.length - 2].cursor
  }, opts);

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(4);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  source = source.slice(0, source.length - 2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort asc using before', async () => {
  const args = {
    sort: {
      by: "lastName",
      order: "asc"
    }
  };

  const opts = {};

  const s = await User.paginateResult({}, args, opts);
  const v = await User.paginateResult({}, {
    ...args,
    before: s.edges[s.edges.length - 2].cursor
  }, opts);

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(4);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a > b);
  source = source.slice(0, source.length - 2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

test('Testing sort desc using before', async () => {
  const args = {
    sort: {
      by: "lastName",
      order: "desc"
    }
  };

  const opts = {};

  const s = await User.paginateResult({}, args, opts);
  const v = await User.paginateResult({}, {
    ...args,
    before: s.edges[s.edges.length - 2].cursor
  }, opts);

  expect(v.totalCount).toBe(6);
  expect(v.edges.length).toBe(4);
  expect(v.pageInfo.hasNextPage).toBe(true);
  expect(v.pageInfo.hasPreviousPage).toBe(false);

  let source = fixtures.map((v) => v.lastName);
  source.sort((a, b) => a < b);
  source = source.slice(0, source.length - 2);

  const result = v.edges.map((v) => v.node.lastName);
  expect(JSON.stringify(result)).toBe(JSON.stringify(source));
});

// FILTERS
test('Testing simple filter', async () => {
  const s = await User.paginateResult({}, {
    filters: {
      isAdmin: true
    }
  }, {
    filterFields: {
      isAdmin: true
    }
  });

  const adminCount = fixtures.filter((v) => v.isAdmin).length;
  expect(s.totalCount).toBe(adminCount);
});

test('Testing custom filter', async () => {
  const s = await User.paginateResult({}, {
    filters: {
      isAdult: true
    }
  }, {
    filterFields: {
      isAdult: (value) => {
        return { age: { [value ? '$gte' : '$lt']: 21 } };
      }
    }
  });

  const adultCount = fixtures.filter((v) => v.age >= 21).length;
  expect(s.totalCount).toBe(adultCount);
});

test('Testing filters combination', async () => {
  const s = await User.paginateResult({}, {
    filters: {
      isAdmin: true,
      isAdult: true
    }
  }, {
    filterFields: {
      isAdmin: true,
      isAdult: (value) => {
        return { age: { [value ? '$gte' : '$lt']: 21 } };
      }
    }
  });

  const mixedCount = fixtures.filter((v) => v.age >= 21 && v.isAdmin).length;
  expect(s.totalCount).toBe(mixedCount);
});

test('Testing unknown filter', async () => {
  const s = await User.paginateResult({}, {
    filters: {
      age: 22
    }
  });

  expect(s.totalCount).toBe(fixtures.length);
});

test('Testing with cursor only (filter only on first query)', async () => {
  const fixtureFilter = (user) => user.age >= 21 && user.isAdmin;
  const s = await User.paginateResult({}, {
    first: 1,
    filters: {
      isAdmin: true,
      isAdult: true
    }
  }, {
    filterFields: {
      isAdmin: true,
      isAdult: (value) => {
        return { age: { [value ? '$gte' : '$lt']: 21 } };
      }
    }
  });

  expect(s.totalCount).toBe(fixtures.filter(fixtureFilter).length);
  expect(s.edges[0].node.firstName).toBe(fixtures.filter(fixtureFilter)[0].firstName);

  const v = await User.paginateResult({}, {
    first: 2,
    after: s.pageInfo.startCursor
  }, {
    filterFields: {
      isAdmin: true,
      isAdult: (value) => {
        return { age: { [value ? '$gte' : '$lt']: 21 } };
      }
    }
  });

  expect(v.edges[0].node.firstName).toBe(fixtures.filter(fixtureFilter)[1].firstName);
  expect(s.totalCount).toBe(fixtures.filter(fixtureFilter).length);
  expect(v.edges.length).toBe(1);
  expect(v.pageInfo.hasNextPage).toBe(false);
  expect(v.pageInfo.hasPreviousPage).toBe(true);
});
