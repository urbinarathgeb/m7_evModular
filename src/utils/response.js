export const success = (res, { message, data, status = 200, pagination = null }) => {
  const body = { status: 'success', message, data };
  if (pagination) body.pagination = pagination;
  return res.status(status).json(body);
};

export const error = (res, { message, status = 500, errors = null }) => {
  const body = { status: 'error', message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};
