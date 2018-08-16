import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
import SortFieldsEnum from './SortFieldsEnumQL';
import SortOrderEnum from './SortOrderEnumQL';

const registeredInputs = {};

export default (type, sortables) => {
  if (registeredInputs[type]) return registeredInputs[type];

  const newType = new GraphQLInputObjectType({
    name: `${type}SortInput`,
    fields: {
      by: {
        type: new GraphQLNonNull(SortFieldsEnum(type, sortables))
      },
      order: {
        type: SortOrderEnum,
        defaultValue: 'asc'
      }
    }
  });

  registeredInputs[type] = newType;
  return newType;
};
