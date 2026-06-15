-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: inventory_pos
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int NOT NULL,
  `user_id` int NOT NULL,
  `entity_type` enum('ORDER','PURCHASE_ORDER','INVENTORY','PRODUCT') NOT NULL,
  `entity_id` int NOT NULL,
  `action` varchar(50) NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shop_id` (`shop_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `shop_id` (`shop_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventories`
--

DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int NOT NULL,
  `product_variant_id` int NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `quantity_on_hand` int NOT NULL DEFAULT '0',
  `available_quantity` int NOT NULL DEFAULT '0',
  `damaged_quantity` int NOT NULL DEFAULT '0',
  `low_stock_threshold` int NOT NULL DEFAULT '5',
  `last_audited` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shop_id` (`shop_id`),
  KEY `product_variant_id` (`product_variant_id`),
  CONSTRAINT `inventories_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventories_ibfk_2` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_variant_stock` CHECK (((`available_quantity` >= 0) and (`damaged_quantity` >= 0) and (`quantity_on_hand` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventory_logs`
--

DROP TABLE IF EXISTS `inventory_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventory_id` int NOT NULL,
  `shop_id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('IN','OUT','ADJUST','DAMAGE','RESTOCK') NOT NULL,
  `description` text,
  `change_amount` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `shop_id` (`shop_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `inventory_logs_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_logs_ibfk_2` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_logs_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_variant_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(12,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `idx_oi_product` (`product_variant_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `order_items_chk_2` CHECK ((`unit_price` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int NOT NULL,
  `cashier_id` int NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `status` enum('DRAFT','CONFIRMED','PAID','CANCELLED') DEFAULT 'DRAFT',
  `payment_method` enum('CASH','BANK_TRANSFER','OTHER') DEFAULT 'OTHER',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `tax` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `paid_at` timestamp NULL DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shop_id` (`shop_id`),
  KEY `cashier_id` (`cashier_id`),
  KEY `idx_order_created` (`created_at`),
  KEY `idx_order_status` (`status`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `product_catalog`
--

DROP TABLE IF EXISTS `product_catalog`;
/*!50001 DROP VIEW IF EXISTS `product_catalog`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `product_catalog` AS SELECT 
 1 AS `shop_id`,
 1 AS `product_id`,
 1 AS `name`,
 1 AS `description`,
 1 AS `is_active`,
 1 AS `category_id`,
 1 AS `category`,
 1 AS `category_des`,
 1 AS `image_id`,
 1 AS `image_url`,
 1 AS `file_name`,
 1 AS `file_size`,
 1 AS `mimetype`,
 1 AS `variant_id`,
 1 AS `product_image_id`,
 1 AS `sku`,
 1 AS `variant_name`,
 1 AS `cost_price`,
 1 AS `selling_price`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `inventory_id`,
 1 AS `location`,
 1 AS `quantity_on_hand`,
 1 AS `available_quantity`,
 1 AS `damaged_quantity`,
 1 AS `low_stock_threshold`,
 1 AS `last_audited`,
 1 AS `inv_created_at`,
 1 AS `inv_updated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `mimetype` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_image_id` int DEFAULT NULL,
  `sku` varchar(50) NOT NULL,
  `variant_name` varchar(100) NOT NULL,
  `cost_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `selling_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sku_per_shop_variant` (`shop_id`,`sku`),
  KEY `product_id` (`product_id`),
  KEY `product_image_id` (`product_image_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variants_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variants_ibfk_3` FOREIGN KEY (`product_image_id`) REFERENCES `product_images` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_variant_prices` CHECK (((`cost_price` >= 0) and (`selling_price` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `category_id` (`category_id`),
  KEY `idx_shop_sku` (`shop_id`,`sku`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `products_view`
--

DROP TABLE IF EXISTS `products_view`;
/*!50001 DROP VIEW IF EXISTS `products_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `products_view` AS SELECT 
 1 AS `shop_id`,
 1 AS `product_id`,
 1 AS `name`,
 1 AS `description`,
 1 AS `is_active`,
 1 AS `category_id`,
 1 AS `category`,
 1 AS `category_des`,
 1 AS `image_id`,
 1 AS `image_url`,
 1 AS `file_name`,
 1 AS `file_size`,
 1 AS `mimetype`,
 1 AS `variant_id`,
 1 AS `product_image_id`,
 1 AS `sku`,
 1 AS `variant_name`,
 1 AS `cost_price`,
 1 AS `selling_price`,
 1 AS `created_at`,
 1 AS `updated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `products_view_test`
--

DROP TABLE IF EXISTS `products_view_test`;
/*!50001 DROP VIEW IF EXISTS `products_view_test`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `products_view_test` AS SELECT 
 1 AS `shop_id`,
 1 AS `product_id`,
 1 AS `name`,
 1 AS `description`,
 1 AS `is_active`,
 1 AS `category_id`,
 1 AS `category`,
 1 AS `category_des`,
 1 AS `image_id`,
 1 AS `image_url`,
 1 AS `file_name`,
 1 AS `file_size`,
 1 AS `mimetype`,
 1 AS `variant_id`,
 1 AS `product_image_id`,
 1 AS `sku`,
 1 AS `variant_name`,
 1 AS `cost_price`,
 1 AS `selling_price`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `location`,
 1 AS `quantity_on_hand`,
 1 AS `available_quantity`,
 1 AS `damaged_quantity`,
 1 AS `low_stock_threshold`,
 1 AS `last_audited`,
 1 AS `inv_created_at`,
 1 AS `inv_updated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `purchase_order_items`
--

DROP TABLE IF EXISTS `purchase_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int NOT NULL,
  `product_variant_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `total_cost` decimal(12,2) GENERATED ALWAYS AS ((`quantity` * `unit_cost`)) STORED,
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `product_variant_id` (`product_variant_id`),
  CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_order_items_ibfk_2` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `purchase_order_items_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `purchase_order_items_chk_2` CHECK ((`unit_cost` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `created_by_user_id` int NOT NULL,
  `status` enum('DRAFT','SENT','CONFIRMED','DELIVERED','CANCELLED') DEFAULT 'DRAFT',
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `total_cost` decimal(12,2) DEFAULT '0.00',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shop_id` (`shop_id`),
  KEY `created_by_user_id` (`created_by_user_id`),
  KEY `idx_po_supplier` (`supplier_id`),
  KEY `idx_po_created` (`created_at`),
  CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `purchase_orders_ibfk_3` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shops`
--

DROP TABLE IF EXISTS `shops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `shops_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text,
  `lead_time_days` int DEFAULT '3',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shop_id` (`shop_id`),
  CONSTRAINT `suppliers_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `auth0_id` varchar(255) NOT NULL,
  `role` enum('ADMIN','MANAGER','STAFF','CASHIER') NOT NULL DEFAULT 'CASHIER',
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth0_id` (`auth0_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `product_catalog`
--

/*!50001 DROP VIEW IF EXISTS `product_catalog`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `product_catalog` AS select `p`.`shop_id` AS `shop_id`,`p`.`id` AS `product_id`,`p`.`name` AS `name`,`p`.`description` AS `description`,`p`.`is_active` AS `is_active`,`cat`.`id` AS `category_id`,`cat`.`name` AS `category`,`cat`.`description` AS `category_des`,`img`.`id` AS `image_id`,`img`.`image_url` AS `image_url`,`img`.`file_name` AS `file_name`,`img`.`file_size` AS `file_size`,`img`.`mimetype` AS `mimetype`,`var`.`id` AS `variant_id`,`var`.`product_image_id` AS `product_image_id`,`var`.`sku` AS `sku`,`var`.`variant_name` AS `variant_name`,`var`.`cost_price` AS `cost_price`,`var`.`selling_price` AS `selling_price`,`var`.`created_at` AS `created_at`,`var`.`updated_at` AS `updated_at`,`inv`.`id` AS `inventory_id`,`inv`.`location` AS `location`,`inv`.`quantity_on_hand` AS `quantity_on_hand`,`inv`.`available_quantity` AS `available_quantity`,`inv`.`damaged_quantity` AS `damaged_quantity`,`inv`.`low_stock_threshold` AS `low_stock_threshold`,`inv`.`last_audited` AS `last_audited`,`inv`.`created_at` AS `inv_created_at`,`inv`.`updated_at` AS `inv_updated_at` from ((((`products` `p` join `categories` `cat` on((`p`.`category_id` = `cat`.`id`))) left join `product_variants` `var` on((`p`.`id` = `var`.`product_id`))) left join `product_images` `img` on((`var`.`product_image_id` = `img`.`id`))) join `inventories` `inv` on((`var`.`id` = `inv`.`product_variant_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `products_view`
--

/*!50001 DROP VIEW IF EXISTS `products_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `products_view` AS select `p`.`shop_id` AS `shop_id`,`p`.`id` AS `product_id`,`p`.`name` AS `name`,`p`.`description` AS `description`,`p`.`is_active` AS `is_active`,`cat`.`id` AS `category_id`,`cat`.`name` AS `category`,`cat`.`description` AS `category_des`,`img`.`id` AS `image_id`,`img`.`image_url` AS `image_url`,`img`.`file_name` AS `file_name`,`img`.`file_size` AS `file_size`,`img`.`mimetype` AS `mimetype`,`var`.`id` AS `variant_id`,`var`.`product_image_id` AS `product_image_id`,`var`.`sku` AS `sku`,`var`.`variant_name` AS `variant_name`,`var`.`cost_price` AS `cost_price`,`var`.`selling_price` AS `selling_price`,`var`.`created_at` AS `created_at`,`var`.`updated_at` AS `updated_at` from (((`products` `p` join `categories` `cat` on((`p`.`category_id` = `cat`.`id`))) left join `product_variants` `var` on((`p`.`id` = `var`.`id`))) left join `product_images` `img` on((`var`.`id` = `img`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `products_view_test`
--

/*!50001 DROP VIEW IF EXISTS `products_view_test`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `products_view_test` AS select `p`.`shop_id` AS `shop_id`,`p`.`id` AS `product_id`,`p`.`name` AS `name`,`p`.`description` AS `description`,`p`.`is_active` AS `is_active`,`cat`.`id` AS `category_id`,`cat`.`name` AS `category`,`cat`.`description` AS `category_des`,`img`.`id` AS `image_id`,`img`.`image_url` AS `image_url`,`img`.`file_name` AS `file_name`,`img`.`file_size` AS `file_size`,`img`.`mimetype` AS `mimetype`,`var`.`id` AS `variant_id`,`var`.`product_image_id` AS `product_image_id`,`var`.`sku` AS `sku`,`var`.`variant_name` AS `variant_name`,`var`.`cost_price` AS `cost_price`,`var`.`selling_price` AS `selling_price`,`var`.`created_at` AS `created_at`,`var`.`updated_at` AS `updated_at`,`inv`.`location` AS `location`,`inv`.`quantity_on_hand` AS `quantity_on_hand`,`inv`.`available_quantity` AS `available_quantity`,`inv`.`damaged_quantity` AS `damaged_quantity`,`inv`.`low_stock_threshold` AS `low_stock_threshold`,`inv`.`last_audited` AS `last_audited`,`inv`.`created_at` AS `inv_created_at`,`inv`.`updated_at` AS `inv_updated_at` from ((((`products` `p` join `categories` `cat` on((`p`.`category_id` = `cat`.`id`))) left join `product_variants` `var` on((`p`.`id` = `var`.`id`))) left join `product_images` `img` on((`var`.`id` = `img`.`id`))) join `inventories` `inv` on((`var`.`id` = `inv`.`product_variant_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-13 15:54:44
