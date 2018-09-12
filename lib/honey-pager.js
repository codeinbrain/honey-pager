import cursorPaginator from './cursor-paginator';
import config from './honey-config';

export default (schema, opts = {}) => {
  schema.statics[opts.methodName || config.get().methodName] = cursorPaginator();
};
