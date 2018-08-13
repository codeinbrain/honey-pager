import cursorPaginator from './cursor-paginator';

export default (schema, opts = {}) => {
  schema.statics[(opts.methodName || "paginateResult")] = cursorPaginator;
}
