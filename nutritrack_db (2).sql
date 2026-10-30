-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 30, 2026 at 11:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nutritrack_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `foods`
--

CREATE TABLE `foods` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `serving_size` varchar(50) DEFAULT NULL,
  `calories` decimal(10,2) NOT NULL,
  `protein` decimal(10,2) NOT NULL,
  `carbohydrates` decimal(10,2) NOT NULL,
  `fat` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `foods`
--

INSERT INTO `foods` (`id`, `name`, `serving_size`, `calories`, `protein`, `carbohydrates`, `fat`) VALUES
(1, 'Rice, white, cooked', '1 cup', 205.00, 4.30, 44.50, 0.40),
(2, 'Rice, brown, cooked', '1 cup', 216.00, 5.00, 45.00, 1.80),
(3, 'Sinangag (garlic fried rice)', '1 cup', 290.00, 5.00, 45.00, 9.00),
(4, 'Pandesal', '1 piece', 85.00, 2.50, 15.00, 1.50),
(5, 'Egg, boiled', '1 piece', 78.00, 6.30, 0.60, 5.30),
(6, 'Egg, fried', '1 piece', 90.00, 6.30, 0.40, 7.00),
(7, 'Longganisa', '1 piece', 130.00, 6.00, 3.00, 10.00),
(8, 'Tocino', '50 g', 140.00, 8.00, 9.00, 8.00),
(9, 'Hotdog', '1 piece', 150.00, 5.00, 3.00, 13.00),
(10, 'Daing na bangus, fried', '100 g', 190.00, 24.00, 0.00, 10.00),
(11, 'Tilapia, fried', '100 g', 170.00, 26.00, 0.00, 7.00),
(12, 'Galunggong, fried', '100 g', 190.00, 24.00, 0.00, 10.00),
(13, 'Sardines in tomato sauce', '1/2 can', 150.00, 11.00, 4.00, 10.00),
(14, 'Chicken adobo', '100 g', 190.00, 20.00, 3.00, 10.00),
(15, 'Pork adobo', '100 g', 270.00, 18.00, 3.00, 20.00),
(16, 'Chicken tinola', '1 cup', 100.00, 12.00, 4.00, 4.00),
(17, 'Pork sinigang', '1 cup', 150.00, 10.00, 8.00, 9.00),
(18, 'Pinakbet', '1 cup', 90.00, 4.00, 12.00, 3.00),
(19, 'Ginisang monggo', '1 cup', 180.00, 10.00, 25.00, 5.00),
(20, 'Kangkong, cooked', '1 cup', 30.00, 3.00, 4.00, 0.50),
(21, 'Sitaw (string beans), cooked', '1 cup', 45.00, 3.00, 9.00, 0.30),
(22, 'Tokwa (tofu), fried', '100 g', 190.00, 14.00, 4.00, 13.00),
(23, 'Lechon kawali', '100 g', 390.00, 20.00, 0.00, 34.00),
(24, 'Lumpiang shanghai', '3 pieces', 180.00, 8.00, 12.00, 11.00),
(25, 'Pancit canton', '1 cup', 220.00, 6.00, 32.00, 8.00),
(26, 'Arroz caldo (lugaw)', '1 cup', 150.00, 8.00, 22.00, 3.00),
(27, 'Kamote (sweet potato), boiled', '1 medium', 115.00, 1.50, 27.00, 0.20),
(28, 'Banana, lakatan', '1 piece', 90.00, 1.00, 23.00, 0.30),
(29, 'Banana, saba, boiled', '1 piece', 110.00, 1.00, 28.00, 0.30),
(30, 'Mango, ripe', '1 cup', 100.00, 1.00, 25.00, 0.50),
(31, 'Papaya, ripe', '1 cup', 55.00, 1.00, 14.00, 0.20),
(32, 'Pineapple', '1 cup', 80.00, 1.00, 20.00, 0.20),
(33, 'Turon', '1 piece', 200.00, 1.00, 30.00, 9.00),
(34, 'Halo-halo', '1 glass', 300.00, 5.00, 55.00, 7.00),
(35, 'Milk, whole', '1 cup', 150.00, 8.00, 12.00, 8.00),
(36, 'Coffee, 3-in-1', '1 sachet', 80.00, 1.00, 16.00, 1.50),
(37, 'Soft drink', '1 bottle (295 ml)', 120.00, 0.00, 32.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `meal_logs`
--

CREATE TABLE `meal_logs` (
  `id` int(11) NOT NULL,
  `meal_type` varchar(20) NOT NULL,
  `food_id` int(11) NOT NULL,
  `servings` decimal(5,2) NOT NULL,
  `meal_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `foods`
--
ALTER TABLE `foods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `meal_logs`
--
ALTER TABLE `meal_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `food_id` (`food_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `foods`
--
ALTER TABLE `foods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `meal_logs`
--
ALTER TABLE `meal_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `meal_logs`
--
ALTER TABLE `meal_logs`
  ADD CONSTRAINT `meal_logs_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
