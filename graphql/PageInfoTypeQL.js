import { GraphQLObjectType, GraphQLBoolean, GraphQLString } from 'graphql';
import PageCursor from './PageCursorScalarQL';

module.exports = new GraphQLObjectType({
	name: 'PageInfo',
	description: "Information about current page",
	fields: () => ({
		startCursor: {
			type: PageCursor
		},
		endCursor: {
			type: PageCursor
		},
		hasNextPage: {
			type: GraphQLBoolean
		},
		hasPreviousPage: {
			type: GraphQLBoolean
		}
	})
});
