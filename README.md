# honey-pager
A [Relay-style](https://facebook.github.io/relay/graphql/connections.htm) cursor pagination tool for [mongoose](https://github.com/Automattic/mongoose) schema. Designed to work with GraphQL.

:warning: _Module and doc are currently under development._

## Usage

```javascript
// User.js
import mongoose, { Schema } from 'mongoose';
import { honeypager } from 'honey-pager';

const schema = Schema({
  firstName:  { type: String },
  lastName:   { type: String },
  email:      { type: String }
});

schema.plugin(honeypager);

export default schema;
```

```javascript
// server.js
import express from 'express';
import User from './User';

let app = express();
// ...
app.get('/users', (req, res) => {
  const result = User.paginateResult();
  res.status(200).json(result);
});
```
This will gives you the following response:
```
{
  "totalCount": 10,
  "edges": [
    {
      "cursor": "...",
      "node": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "jdoe@test.com"
      }
    },
    ...
  ],
  "pageInfo": {
    "startCursor": "...",
    "endCursor": "...",
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```
