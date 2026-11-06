import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home.component';
import { ProductsComponent } from './pages/products.component';
import { ProductDetailsComponent } from './pages/product-details.component';
import { CartComponent } from './pages/cart.component';
import { AdminProductsComponent } from './pages/admin-products.component';
import { LoginComponent } from './pages/login.component';
import { OrdersComponent } from './pages/orders.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { AdminAnalyticsComponent } from './pages/admin-analytics/admin-analytics.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { AdminAddProductComponent } from './pages/admin-add-product.component';
import { AdminCreateCouponComponent } from './pages/admin-create-coupon.component';
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'products',
    component: ProductsComponent
  },
  {
    path: 'product/:id',
    component: ProductDetailsComponent
  },
  {
    path: 'cart',
    component: CartComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'orders',
    component: OrdersComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'admin/products',
    component: AdminProductsComponent
  },
  {
    path: 'admin/analytics',
    component: AdminAnalyticsComponent
  },
  { path: 'admin/orders', component: AdminOrdersComponent },

  { path: 'admin/add-product', component: AdminAddProductComponent },
  { path: 'admin/create-coupon', component: AdminCreateCouponComponent },
  {
    path: '**',
    redirectTo: ''
  }

];