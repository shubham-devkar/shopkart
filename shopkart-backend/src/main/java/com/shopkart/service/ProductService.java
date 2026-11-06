package com.shopkart.service;

import com.shopkart.entity.Product;
import java.util.List;

public interface ProductService {
    Product createProduct(Product product);
    List<Product> getAllProducts();
    Product getProductById(Long id);
    Product updateProduct(Long id, Product product);
    void deleteProduct(Long id);
    List<Product> searchProducts(String name);
    List<Product> getProductsByCategory(String category);
}
