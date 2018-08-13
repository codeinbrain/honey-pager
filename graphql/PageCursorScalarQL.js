import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';
import validator from 'validator';
import jwt from 'jsonwebtoken';

const stringifyCursor = (value) => {
  return jwt.sign(value, 'shhhhh', {
    noTimestamp: true
  });
}

const cursorify = (value) => {
  try {
    return jwt.verify(value, 'shhhhh', {
      ignoreExpiration: true
    });
  } catch (error) {
    throw ErrorQL.badRequest('invalid', 'invalid_cursor');
  }
}

export default new GraphQLScalarType({
  name: 'PageCursor',
  parseValue(value) {
    return cursorify(value);
  },
  serialize(value) {
    return stringifyCursor(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return cursorify(ast.value);
    }

    throw ErrorQL.invalidPageCursor;
  }
});
