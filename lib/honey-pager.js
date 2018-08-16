import cursorPaginator from './cursor-paginator';

const defaultOpts = {
  methodName: 'paginateResult'
};

export default (schema, opts = {}) => {
  opts = {...defaultOpts, ...opts};
  schema.statics[opts.methodName] = cursorPaginator(opts);
};
