import { HttpInterceptorFn } from '@angular/common/http';

export const xsrf: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next(req);
  }
  const token = document.cookie
    .split('; ')
    .find(c => c.startsWith('XSRF-TOKEN='))
    ?.substring('XSRF-TOKEN='.length);

  return next(token
    ? req.clone({ setHeaders: { 'X-XSRF-TOKEN': decodeURIComponent(token) } })
    : req);
};
