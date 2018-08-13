import { GraphQLObjectType, GraphQLString } from 'graphql';
import PageCursor from './PageCursorScalarQL';

export default (type) => {
	return new GraphQLObjectType({
		name: type + 'Edge',
		description: "Generic edge to allow cursors",
		fields: () => ({
			node: {
				type: type
			},
			cursor: {
				type: PageCursor
			}
		})
	});
}
