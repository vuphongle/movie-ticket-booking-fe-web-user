import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/slices/auth.slice';
import { authApi } from '@/app/services/auth.api';
import { userApi } from '@/app/services/user.api';
import { movieApi } from './services/movie.api';
import { blogApi } from './services/blog.api';
import { reviewApi } from './services/review.api';
import { couponApi } from './services/coupon.api';
import { showtimeApi } from './services/showTime.api';
import { cineApi } from './services/cine.api';
import { auditoriumApi } from './services/auditorium.api';
import { additionalServiceApi } from './services/additionalService.api';

import { checkStatusMiddleware } from '@app/middlewares/middlewares';

export const Store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [movieApi.reducerPath]: movieApi.reducer,
    [blogApi.reducerPath]: blogApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
    [showtimeApi.reducerPath]: showtimeApi.reducer,
    [cineApi.reducerPath]: cineApi.reducer,
    [auditoriumApi.reducerPath]: auditoriumApi.reducer,
    [additionalServiceApi.reducerPath]: additionalServiceApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
        authApi.middleware, 
        userApi.middleware, 
        movieApi.middleware, 
        blogApi.middleware, 
        reviewApi.middleware, 
        couponApi.middleware,
        showtimeApi.middleware,
        cineApi.middleware,
        auditoriumApi.middleware,
        additionalServiceApi.middleware,
        checkStatusMiddleware
    ),
});

export type RootState = ReturnType<typeof Store.getState>;
