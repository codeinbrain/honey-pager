import { GraphQLObjectType, GraphQLList, GraphQLInt } from 'graphql';
import EdgeType from './EdgeTypeQL';
import PageInfoType from './PageInfoTypeQL';

const registeredTypes = {};

export default (type) => {
  if (registeredTypes[type]) return registeredTypes[type];

  const newType = new GraphQLObjectType({
    name: type + 'Page',
    fields: () => ({
      totalCount: {
        type: GraphQLInt
      },
      edges: {
        type: new GraphQLList(EdgeType(type))
      },
      pageInfo: {
        type: PageInfoType
      }
    })
  });

  registeredTypes[type] = newType;
  return newType;
};
