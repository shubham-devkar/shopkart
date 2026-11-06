
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const savedUser = localStorage.getItem('shopkart-user');

  console.log('INTERCEPTOR CALLED:', req.url);
  console.log('SAVED USER FOUND:', !!savedUser);

  if (!savedUser) {
    console.warn('USER NOT FOUND IN LOCAL STORAGE');
    return next(req);
  }

  try {
    const user = JSON.parse(savedUser);
    const token = user?.token;

    console.log('TOKEN FOUND:', !!token);

    if (!token) {
      console.warn('TOKEN MISSING');
      return next(req);
    }

    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      'AUTHORIZATION HEADER ADDED:',
      authRequest.headers.has('Authorization')
    );

    return next(authRequest);

  } catch (error) {
    console.error('INTERCEPTOR ERROR:', error);
    return next(req);
  }
};
