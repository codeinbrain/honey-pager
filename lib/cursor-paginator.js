import drop from 'lodash/drop';
import dropRight from 'lodash/dropRight';
import head from 'lodash/first';
import tail from 'lodash/last';
import { validateCursor, generateCursor } from './cursor-helpers';

export default () => {
  return function(query = {}, args = {}, opts = {}) {
    return new Promise(async (resolve, reject) => {
      if (args.first !== undefined && args.last !== undefined) {
        return reject(new TypeError('first and last cannot be set at the same time.'));
      }

      let { after, before } = args;

      try {
        if (after) { after = await validateCursor(after); }
        if (before) { before = await validateCursor(before); }
      } catch (err) {
        return reject(err);
      }

      query = { $and: [query] };
      if (args.search) {
        const s = (opts.searchFields || []).map((v) => {
          const filter = {};
          filter[v] = { '$regex': `${args.search}`, '$options': 'i' };
          return filter;
        });

        query.$and.push({ $or: s });
      }

      const totalCount = await this.countDocuments(query);
      const { first, last } = args;
      const limit = first || last || 1000;
      const isDescSort = (args.sort && args.sort.order === 'desc');
      var hasNextPage = false, hasPreviousPage = false;
      var skip = 0;
      var sort = {};

      const buildCursorCondition = (cursor, way) => {
        if (cursor.sort) {
          let { _id, sort: { field, value } } = cursor;
          return {
            $or: [{
              [field]: { [way]: value }
            }, {
              [field]: value,
              _id: { [way]: _id }
            }]
          };
        }

        return { _id: { [way]: cursor._id } };
      };

      var dataQuery = query;
      if (after) {
        dataQuery.$and.push(buildCursorCondition(after, (isDescSort ? '$lt' : '$gt')));
        hasPreviousPage = true;
      }

      if (before) {
        dataQuery.$and.push(buildCursorCondition(before, (isDescSort ? '$gt' : '$lt')));
        hasNextPage = true;
      }

      const hasOffset = !(hasNextPage && hasPreviousPage);

      if (last) {
        let offset = totalCount - last - (hasOffset ? 1 : 0);
        if (before) offset -= 1;
        skip = offset < 0 ? 0 : offset;
      }

      if (args.sort) {
        let { order } = args.sort;
        sort = {
          [args.sort.by]: order,
          _id: order
        };
      }

      let data = await this
        .find(dataQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit + (hasOffset ? 1 : 0));

      if (hasOffset && data.length > limit) {
        if (first) {
          hasNextPage = true;
        }

        if (last) {
          hasPreviousPage = true;
        }

        if (first || after) {
          data = dropRight(data);
        } else if (last || before) {
          data = drop(data);
        }
      }

      const edges = data.map((v) => ({
        cursor: generateCursor(v, args.sort),
        node: v
      }));

      resolve({
        totalCount,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: (head(edges) ? head(edges).cursor : null),
          endCursor: (tail(edges) ? tail(edges).cursor : null)
        },
        edges
      });
    });
  };
};
