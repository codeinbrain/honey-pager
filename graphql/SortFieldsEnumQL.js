import { GraphQLEnumType } from 'graphql';

const registeredEnums = {};

export default (type, sortables) => {
	if (registeredEnums[type]) return registeredEnums[type];

  const fields = {};
  sortables.forEach((v) => {
    fields[v] = { value: v };
  });

	const newEnum = new GraphQLEnumType({
    name: `${type}SortFieldsEnum`,
    values: fields
  });

	registeredEnums[type] = newEnum;
	return newEnum;
}
