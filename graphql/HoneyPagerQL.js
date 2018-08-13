import { GraphQLInt, GraphQLString } from 'graphql';
import PageType from './PageTypeQL';
import PageCursor from './PageCursorScalarQL';
import SortInput from './SortInputQL';

export default (config) => {
	const objectArgs = config.args;
	config.args = {
		...objectArgs,
		...{
			first: { type: GraphQLInt },
			last: { type: GraphQLInt },
			after: { type: PageCursor },
			before: { type: PageCursor },
			search: { type: GraphQLString },
		}
	}

  if (config.sortables) {
    config.args.sort = { type: SortInput(config.type, config.sortables) };
  }

	config.type = PageType(config.type);

	return config;
}
