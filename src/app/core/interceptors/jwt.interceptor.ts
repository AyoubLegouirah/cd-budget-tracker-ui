import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthRoute = req.url.includes('/api/auth/');
  const raw = localStorage.getItem('token');
  const token = raw && raw !== 'null' && raw !== 'undefined' ? raw : null;
  if (token && !isAuthRoute) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
