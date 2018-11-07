# Description
HoneyPager is a [Relay-style](https://facebook.github.io/relay/graphql/connections.htm) cursor pagination tool for [mongoose](https://github.com/Automattic/mongoose) schema. It is mostly designed to work with GraphQL.

# Warnings
* Module and doc are currently under development. It is possible that you encounter some bugs.
* For now, this module has only been tested in a GraphQL environment (with a GraphQL layer on top and not only with a "standalone" mongoose). It is possible that some features are missing for a non-GraphQL environment.

Feel free to open an issue for any issue you have.

# Quick view

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

## Installation
```
yarn add honey-pager
```
```
npm i honey-pager --save
```

# Configuration
Updating the `honey-pager` config is very simple:
```javascript
import { config } from 'honey-pager';

config.update({
  cursorSecret: "mySecret"
});
```

Here are the configuration variables you can edit:

| Name  | Type | Description
| ------------- | ------------- | ------------- |
| cursorSecret  | string  | The key used by JWT to encrypt the cursor value. Default: `shhhhh`  |
| methodName  | string | The name of the static method used to paginate results. Default: `paginateResult`  |

> :warning: Make sure to call `config.update` before any honey-pager config usage such as mongoose plugin or cursor generation. Otherwise, it will throw an error.

Let's consider the following examples:

- NOT correct
```javascript
// ...
schema.plugin(honeypager);
// ...
config.update({ methodName: "paginateIt" });
```

- Correct
```javascript
// ...
config.update({ methodName: "paginateIt" });
// ...
schema.plugin(honeypager);
```

Restricting multiple calls to `config.update` ensure you that your config remains the same at any time.

# Usage
## With the model
This is how you should call honey-pager to make a paginated call:
```javascript
YourModel.paginateResult(yourQuery, args, options);
```
### Model
As mentionned above, you should add the `honeypager` plugin to your model schema:
```javascript
import { honeypager } from 'honey-pager';
// ...
schema.plugin(honeypager);
```
After that, you will be able to call `Model.paginateResult`.

### Query
The query is a basic mongoose query object.

### Arguments
These are the arguments used to paginate the result. They usually are coming from the client. You can pass:
* `after` - If you want all the results after a specific cursor
* `before` - If you want all the results before a specific cursor
* `first` - Get the first **n** results
* `last` - Get the last **n** results
* `search` - A string to look for among the `searchFields` (see options below)
* `sort` - An object that contains the field and the way to sort the results

  ```javascript
  { sort: { by: "firstName", order: "desc" } }
  ```
* `filters` - An object that contains filters if needed.
You can give any number of filters you want as long as their keys are in the `filterFields` (see options below)

  ```javascript
  {
    filters: {
      isAdmin: true,
      isAdult: true
      ...
    }
  }
  ```

### Options
Options are here to customize the way you paginate your results. Here are the different options:
* `searchFields` - An array of schema field names on which you allow searching
* `sortables` - An array of schema field names on which you allow sorting
* `filterFields` - An object that contains whitelisted filters and how to deal with them
  * If you give a `boolean` value as follow, it means that this field is allowed (or not if `false`) as a filter.
  It will result in a basic comparison (field `isAdmin` equals `true` for the example below).
  ```javascript
  {
      filterFields: {
        isAdmin: true
      }
  }
  ```
  * Now, if you give a `function`, you will be able to create your own comparison.
  For the example, let's say that our model doesn't have an `isAdult` field but just the user `age`.
  ```javascript
  {
      isAdult: (value) => {
        return { age: { [value ? '$gte' : '$lt']: 21 } };
      }
  }
  ```
  With this resolver, HoneyPager will know how to deal with the `isAdult` field.

## With GraphQL
This part will be written soon :smile:
