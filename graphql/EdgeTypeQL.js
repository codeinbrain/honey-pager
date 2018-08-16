import { GraphQLObjectType, GraphQLString } from 'graphql';

const registeredEdges = {};

export default (type) => {
  if (registeredEdges[type]) return registeredEdges[type];

  const newType = new GraphQLObjectType({
    name: type + 'Edge',
    description: 'Generic edge to allow cursors',
    fields: () => ({
      node: {
        type: type
      },
      cursor: {
        type: GraphQLString
      }
    })
  });

  registeredEdges[type] = newType;
  return newType;
};
