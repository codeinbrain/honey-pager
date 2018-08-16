import { GraphQLInt, GraphQLString } from 'graphql';
import PageType from './PageTypeQL';
import SortInput from './SortInputQL';

export default (config) => {
  const objectArgs = config.args;
  config.args = {
    ...objectArgs,
    ...{
      first: { type: GraphQLInt },
      last: { type: GraphQLInt },
      after: { type: GraphQLString },
      before: { type: GraphQLString },
      search: { type: GraphQLString },
    }
  };

  if (config.sortables) {
    config.args.sort = { type: SortInput(config.type, config.sortables) };
  }

  config.type = PageType(config.type);

  return config;
};
