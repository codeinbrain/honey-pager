import { GraphQLObjectType, GraphQLBoolean, GraphQLString } from 'graphql';

module.exports = new GraphQLObjectType({
	name: 'PageInfo',
	description: "Information about current page",
	fields: () => ({
		startCursor: {
			type: GraphQLString
		},
		endCursor: {
			type: GraphQLString
		},
		hasNextPage: {
			type: GraphQLBoolean
		},
		hasPreviousPage: {
			type: GraphQLBoolean
		}
	})
});
