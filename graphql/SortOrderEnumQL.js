import { GraphQLEnumType } from 'graphql';

export default new GraphQLEnumType({
  name: 'SortOrderEnum',
  values: {
    asc: { value: "asc" },
    desc: { value: "desc" }
  }
});
