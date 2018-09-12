import jwt from 'jsonwebtoken';
import config from './honey-config';

export const validateCursor = (value) => {
  return new Promise((resolve, reject) => {
    try {
      const cursor = jwt.verify(value, config.get().cursorSecret, {
        ignoreExpiration: true
      });
      resolve(cursor);
    } catch (error) {
      reject(new TypeError('Invalid cursor'));
    }
  });
};

export const generateCursor = (node, sort) => {
  let obj = { _id: node._id };
  if (sort) {
    obj.sort = {
      field: sort.by,
      value: node[sort.by]
    };
  }

  return jwt.sign(obj, config.get().cursorSecret, {
    noTimestamp: true
  });
};
