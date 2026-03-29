import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DishesPage from './pages/DishesPage';
import DishCreatePage from './pages/DishCreatePage';
import DishEditPage from './pages/DishEditPage';
import DishDetailPage from './pages/DishDetailPage';

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/create" element={<ProductCreatePage />} />
            <Route path="/products/:id/edit" element={<ProductEditPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/dishes" element={<DishesPage />} />
            <Route path="/dishes/create" element={<DishCreatePage />} />
            <Route path="/dishes/:id/edit" element={<DishEditPage />} />
            <Route path="/dishes/:id" element={<DishDetailPage />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;