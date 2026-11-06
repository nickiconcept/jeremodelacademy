-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 02, 2026 at 03:48 PM
-- Server version: 10.11.19-MariaDB
-- PHP Version: 8.4.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jeremode_jma_school`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_sessions`
--

CREATE TABLE `academic_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `session_name` varchar(255) NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_sessions`
--

INSERT INTO `academic_sessions` (`id`, `session_name`, `is_current`) VALUES
(1, '2026/2027', 1);

-- --------------------------------------------------------

--
-- Table structure for table `account_setup_tokens`
--

CREATE TABLE `account_setup_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_role` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `module` varchar(255) DEFAULT NULL,
  `target_type` varchar(255) DEFAULT NULL,
  `target_id` bigint(20) UNSIGNED DEFAULT NULL,
  `target_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `user_role`, `user_name`, `action`, `module`, `target_type`, `target_id`, `target_name`, `description`, `meta`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.120.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 19:00:44', '2026-09-30 19:00:44'),
(2, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.120.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 19:13:14', '2026-09-30 19:13:14'),
(3, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.238.177', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-30 20:10:17', '2026-09-30 20:10:17'),
(4, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.238.177', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-30 20:10:50', '2026-09-30 20:10:50'),
(5, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.238.177', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 20:16:27', '2026-09-30 20:16:27'),
(6, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.118.134', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36', '2026-10-01 00:20:06', '2026-10-01 00:20:06'),
(7, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.113.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 14:52:43', '2026-10-01 14:52:43'),
(8, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.113.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 15:11:14', '2026-10-01 15:11:14'),
(9, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.113.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 16:53:52', '2026-10-01 16:53:52'),
(10, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.113.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 17:09:32', '2026-10-01 17:09:32'),
(11, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.113.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 18:18:52', '2026-10-01 18:18:52'),
(12, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.113.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 18:22:46', '2026-10-01 18:22:46'),
(13, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 18:28:44', '2026-10-01 18:28:44'),
(14, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 18:29:17', '2026-10-01 18:29:17'),
(15, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 18:45:07', '2026-10-01 18:45:07'),
(16, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 18:45:41', '2026-10-01 18:45:41'),
(17, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 19:12:52', '2026-10-01 19:12:52'),
(18, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 19:15:20', '2026-10-01 19:15:20'),
(19, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 19:31:31', '2026-10-01 19:31:31'),
(20, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 19:40:33', '2026-10-01 19:40:33'),
(21, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 21:40:27', '2026-10-01 21:40:27'),
(22, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 21:42:55', '2026-10-01 21:42:55'),
(23, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 21:50:47', '2026-10-01 21:50:47'),
(24, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-10-01 23:04:42', '2026-10-01 23:04:42'),
(25, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.117.9.198', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-02 15:13:22', '2026-10-02 15:13:22'),
(26, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.120.239', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-02 16:12:10', '2026-10-02 16:12:10'),
(27, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.120.239', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', '2026-10-02 16:18:28', '2026-10-02 16:18:28'),
(28, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.120.239', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', '2026-10-02 16:19:24', '2026-10-02 16:19:24'),
(29, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.120.239', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', '2026-10-02 16:35:38', '2026-10-02 16:35:38'),
(30, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.120.239', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', '2026-10-02 16:47:13', '2026-10-02 16:47:13'),
(31, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '197.211.61.100', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', '2026-10-02 19:41:42', '2026-10-02 19:41:42'),
(32, 1, 'admin', 'Super Admin', 'login', 'auth', 'user', 1, 'Super Admin', 'Super Admin (admin) logged in', NULL, '105.112.120.239', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-02 20:46:27', '2026-10-02 20:46:27');

-- --------------------------------------------------------

--
-- Table structure for table `affective_skills`
--

CREATE TABLE `affective_skills` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `target_section` varchar(255) NOT NULL DEFAULT 'secondary'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('jere-model-academy-cache-356a192b7913b04c54574d18c28d46e6395428ab', 'i:1;', 1790960003),
('jere-model-academy-cache-356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1790960003;', 1790960003),
('jere-model-academy-cache-5ce2f3549cc2e32184e22bb481736d21caf3724f', 'i:1;', 1790955762),
('jere-model-academy-cache-5ce2f3549cc2e32184e22bb481736d21caf3724f:timer', 'i:1790955762;', 1790955762),
('jere-model-academy-cache-d184b193775d5a34bdaf43aaf0228873163e365f', 'i:1;', 1790959647),
('jere-model-academy-cache-d184b193775d5a34bdaf43aaf0228873163e365f:timer', 'i:1790959647;', 1790959647);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `tier` enum('nursery','primary','jss','sss') NOT NULL,
  `form_master_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_virtual` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `tier`, `form_master_id`, `created_at`, `updated_at`, `is_virtual`) VALUES
(1, 'Nursery 1', 'nursery', NULL, NULL, NULL, 0),
(2, 'Nursery 2', 'nursery', NULL, NULL, NULL, 0),
(3, 'Primary 1', 'primary', NULL, NULL, NULL, 0),
(4, 'JSS 1A', 'jss', NULL, NULL, NULL, 0),
(5, 'JSS 1B', 'jss', NULL, NULL, NULL, 0),
(6, 'JSS 2A', 'jss', NULL, NULL, NULL, 0),
(7, 'JSS 2B', 'jss', NULL, NULL, NULL, 0),
(8, 'JSS 3A', 'jss', NULL, NULL, NULL, 0),
(9, 'JSS 3B', 'jss', NULL, NULL, NULL, 0),
(10, 'SSS 1A', 'sss', NULL, NULL, NULL, 0),
(11, 'SSS 1B', 'sss', NULL, NULL, NULL, 0),
(12, 'SSS 2A', 'sss', NULL, NULL, NULL, 0),
(13, 'SSS 2B', 'sss', NULL, NULL, NULL, 0),
(14, 'SSS 2C', 'sss', NULL, NULL, NULL, 0),
(15, 'SSS 3A', 'sss', NULL, NULL, NULL, 0),
(16, 'SSS 3B', 'sss', NULL, NULL, NULL, 0),
(17, 'SSS 3C', 'sss', NULL, NULL, NULL, 0),
(18, 'Nursery 3', 'nursery', NULL, NULL, NULL, 0),
(19, 'Primary 2', 'primary', NULL, NULL, NULL, 0),
(20, 'Primary 3', 'primary', NULL, NULL, NULL, 0),
(21, 'Primary 4', 'primary', NULL, NULL, NULL, 0),
(22, 'Primary 5', 'primary', NULL, NULL, NULL, 0),
(24, 'JSS Graduates Waiting Room', 'jss', NULL, NULL, NULL, 1),
(25, 'Primary Graduates Waiting Room', 'primary', NULL, NULL, NULL, 1),
(26, 'Nursery Graduates Waiting Room', 'nursery', NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `class_subjects`
--

CREATE TABLE `class_subjects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `event_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_invoices`
--

CREATE TABLE `fee_invoices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'School Fees',
  `amount_due` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'unpaid',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_structures`
--

CREATE TABLE `fee_structures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'School Fees',
  `amount` decimal(10,2) NOT NULL,
  `tier` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `term` varchar(255) NOT NULL,
  `academic_year` varchar(255) NOT NULL,
  `ca1` double NOT NULL DEFAULT 0,
  `ca2` double NOT NULL DEFAULT 0,
  `ca3` double NOT NULL DEFAULT 0,
  `ca4` double NOT NULL DEFAULT 0,
  `exam_score` double NOT NULL DEFAULT 0,
  `total_score` double NOT NULL DEFAULT 0,
  `grade_letter` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_08_27_174742_create_classes_table', 1),
(5, '2026_08_27_174743_create_students_table', 1),
(6, '2026_08_27_174745_create_subjects_table', 1),
(7, '2026_08_27_174746_create_grades_table', 1),
(8, '2026_08_27_182633_create_system_settings_table', 1),
(9, '2026_08_27_182634_create_teachers_table', 1),
(10, '2026_08_27_182635_create_class_subjects_table', 1),
(11, '2026_08_27_182637_create_fee_structures_table', 1),
(12, '2026_08_27_182638_create_fee_invoices_table', 1),
(13, '2026_08_27_223232_create_missing_tables', 1),
(14, '2026_08_28_142426_change_passport_photo_column_in_users_table', 1),
(15, '2026_08_29_210804_add_unique_constraint_to_fee_invoices', 1),
(16, '2026_08_31_150000_create_activity_logs_table', 1),
(17, '2026_09_01_193327_create_report_card_remarks_table', 1),
(18, '2026_09_01_193329_add_remark_settings_to_system_settings_table', 1),
(19, '2026_09_02_194524_add_details_to_teachers_table', 1),
(20, '2026_09_14_200659_create_scheme_of_works_table', 1),
(21, '2026_09_14_200701_create_sow_progress_table', 1),
(22, '2026_09_14_200741_add_sow_visibility_to_system_settings_table', 1),
(23, '2026_09_15_101425_add_geofencing_to_system_settings_table', 1),
(24, '2026_09_15_101912_add_location_names_to_system_settings_table', 1),
(25, '2026_09_15_104108_add_school_logo_to_system_settings_table', 1),
(26, '2026_09_15_131817_create_events_table', 1),
(27, '2026_09_15_131820_create_slides_table', 1),
(28, '2026_09_15_131821_create_timetables_table', 1),
(29, '2026_09_15_131823_add_website_fields_to_system_settings_table', 1),
(30, '2026_09_16_114108_add_ticker_to_system_settings_table', 1),
(31, '2026_09_16_120743_add_about_us_image_to_system_settings_table', 1),
(32, '2026_09_16_134546_add_break_fields_to_timetables_table', 1),
(33, '2026_09_16_151124_add_permissions_to_users_table', 1),
(34, '2026_09_17_185429_add_auto_assign_tier_to_subjects_table', 1),
(35, '2026_09_17_191520_create_tier_subjects_table', 1),
(36, '2026_09_17_201129_add_is_virtual_to_classes_table', 1),
(37, '2026_09_30_061531_add_parent_email_to_students_table', 1),
(38, '2026_09_30_064946_create_account_setup_tokens_table', 1),
(39, '2026_09_30_093200_add_must_change_password_to_users_table', 1),
(40, '2026_10_01_132630_add_attendance_geofencing_enabled_to_system_settings_table', 2),
(41, '2026_10_02_072842_create_result_publications_table', 3),
(42, '2026_10_02_113729_add_note_to_sow_progress_table', 3);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promoted_classes`
--

CREATE TABLE `promoted_classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `session_name` varchar(255) NOT NULL,
  `promoted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `psychomotor_skills`
--

CREATE TABLE `psychomotor_skills` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `target_section` varchar(255) NOT NULL DEFAULT 'secondary'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `psychomotor_skills`
--

INSERT INTO `psychomotor_skills` (`id`, `name`, `target_section`) VALUES
(9, 'Arabic/Calligraphic', 'secondary'),
(13, 'Clubs', 'secondary'),
(11, 'Craft/Art', 'secondary'),
(10, 'Drama/Singing', 'secondary'),
(16, 'Drawing & Tools', 'primary'),
(8, 'Fluency', 'secondary'),
(14, 'Handling of tools/labs & workshop', 'secondary'),
(15, 'Handling Tools', 'primary'),
(7, 'Handwriting', 'all'),
(3, 'Musical Skills', 'primary'),
(12, 'Press Club', 'secondary'),
(5, 'Sports & Games', 'all'),
(6, 'Verbal Fluency', 'primary');

-- --------------------------------------------------------

--
-- Table structure for table `report_card_remarks`
--

CREATE TABLE `report_card_remarks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `term` varchar(255) NOT NULL,
  `academic_year` varchar(255) NOT NULL,
  `class_teacher_remark` text DEFAULT NULL,
  `principal_remark` text DEFAULT NULL,
  `is_ai_generated` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result_pins`
--

CREATE TABLE `result_pins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pin` varchar(255) NOT NULL,
  `student_id` bigint(20) UNSIGNED DEFAULT NULL,
  `term` varchar(255) DEFAULT NULL,
  `academic_year` varchar(255) DEFAULT NULL,
  `usage_count` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result_publications`
--

CREATE TABLE `result_publications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `term` varchar(40) NOT NULL,
  `academic_year` varchar(40) NOT NULL,
  `published_by` bigint(20) UNSIGNED DEFAULT NULL,
  `published_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result_publication_events`
--

CREATE TABLE `result_publication_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `term` varchar(40) NOT NULL,
  `academic_year` varchar(40) NOT NULL,
  `action` varchar(20) NOT NULL,
  `scope` varchar(20) NOT NULL,
  `class_id` bigint(20) UNSIGNED DEFAULT NULL,
  `performed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `performed_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scheme_of_works`
--

CREATE TABLE `scheme_of_works` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `tier` varchar(255) NOT NULL COMMENT 'nursery, primary, jss, sss, universal',
  `term` varchar(255) NOT NULL COMMENT 'First Term, Second Term, Third Term',
  `week` int(11) NOT NULL,
  `topic` varchar(255) NOT NULL,
  `sub_topic` text DEFAULT NULL,
  `objectives` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('MSFjjWBUikmkdcKgqAUlRjNOzivOpvIr6w7nLdvH', NULL, '167.99.70.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJ5QXlBRms4RzhqYUUzWmxvUk1adkczS21RVFNVM1h3SVgwNVBHNFQyIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL3d3dy5hcGkuamVyZW1vZGVsYWNhZGVteS5jb20ubmciLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1790956643);

-- --------------------------------------------------------

--
-- Table structure for table `slides`
--

CREATE TABLE `slides` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `slides`
--

INSERT INTO `slides` (`id`, `image_url`, `caption`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 'https://api.jeremodelacademy.com.ng/storage/slides/slide_6abfe147afc43.jpg', 'Jere Model Academy Launches online school portal', 1, '2026-10-02 20:52:23', '2026-10-02 20:52:23');

-- --------------------------------------------------------

--
-- Table structure for table `sow_progress`
--

CREATE TABLE `sow_progress` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `scheme_of_work_id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `academic_session` varchar(255) NOT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('pending','completed') NOT NULL DEFAULT 'pending',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED DEFAULT NULL,
  `admission_number` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `class_of_entry` varchar(255) DEFAULT NULL,
  `term_year_of_entry` varchar(255) DEFAULT NULL,
  `last_school_attended` varchar(255) DEFAULT NULL,
  `address_residence` text DEFAULT NULL,
  `sex` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `local_government` varchar(255) DEFAULT NULL,
  `state_of_origin` varchar(255) DEFAULT NULL,
  `handicapped` tinyint(1) NOT NULL DEFAULT 0,
  `handicap_details` text DEFAULT NULL,
  `parent_name` varchar(255) DEFAULT NULL,
  `parent_email` varchar(255) DEFAULT NULL,
  `parent_address` text DEFAULT NULL,
  `parent_phone` varchar(255) DEFAULT NULL,
  `undertaking_signed` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_affective_eval`
--

CREATE TABLE `student_affective_eval` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `skill_id` bigint(20) UNSIGNED NOT NULL,
  `term` varchar(255) NOT NULL,
  `academic_year` varchar(255) NOT NULL,
  `rating` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_psychomotor_eval`
--

CREATE TABLE `student_psychomotor_eval` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `skill_id` bigint(20) UNSIGNED NOT NULL,
  `term` varchar(255) NOT NULL,
  `academic_year` varchar(255) NOT NULL,
  `rating` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `tier` enum('nursery','primary','jss','sss','universal') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `name`, `category`, `tier`, `created_at`, `updated_at`) VALUES
(1, 'English Language', NULL, 'universal', '2026-09-17 18:22:26', '2026-09-17 18:22:26'),
(2, 'Mathematics', NULL, 'universal', '2026-09-17 18:22:26', '2026-09-17 18:22:26'),
(3, 'Science & Health Habits', NULL, 'universal', '2026-09-17 18:22:26', '2026-09-17 18:22:26'),
(4, 'Social Habits', NULL, 'universal', '2026-09-17 18:22:26', '2026-09-17 18:22:26'),
(5, 'Writing', NULL, 'universal', '2026-09-17 18:22:26', '2026-09-17 18:22:26'),
(6, 'Drawing', NULL, 'universal', '2026-09-17 18:22:27', '2026-09-17 18:22:27'),
(7, 'Ryhmes', NULL, 'universal', '2026-09-17 18:22:27', '2026-09-17 18:22:27'),
(8, 'Basic Science', NULL, 'universal', '2026-09-17 18:22:27', '2026-09-17 18:22:27'),
(9, 'Social Studies & Citizenship', NULL, 'universal', '2026-09-17 18:22:27', '2026-09-17 18:22:27'),
(10, 'Culture & Creative Art (CCA)', NULL, 'universal', '2026-09-17 18:22:27', '2026-09-17 18:22:27'),
(11, 'Physical Health Education (PHE)', NULL, 'universal', '2026-09-17 18:22:27', '2026-09-17 18:22:27'),
(12, 'CRK', NULL, 'universal', '2026-09-17 18:22:28', '2026-09-17 18:22:28'),
(13, 'IRK', NULL, 'universal', '2026-09-17 18:22:28', '2026-09-17 18:22:28'),
(14, 'Home Economics', NULL, 'universal', '2026-09-17 18:22:28', '2026-09-17 18:22:28'),
(15, 'Quantitative Reasoning', NULL, 'universal', '2026-09-17 18:22:28', '2026-09-17 18:22:28'),
(16, 'Verbal Reasoning', NULL, 'universal', '2026-09-17 18:22:28', '2026-09-17 18:22:28'),
(17, 'Computer Education', NULL, 'universal', '2026-09-17 18:22:28', '2026-09-17 18:22:28'),
(18, 'Civic Education', NULL, 'universal', '2026-09-17 18:22:28', '2026-09-17 18:22:28'),
(19, 'Agricultural Science', NULL, 'universal', '2026-09-17 18:22:28', '2026-09-17 18:22:28'),
(20, 'Geography', NULL, 'universal', '2026-09-17 18:22:29', '2026-09-17 18:22:29'),
(21, 'Economics', NULL, 'universal', '2026-09-17 18:22:29', '2026-09-17 18:22:29'),
(22, 'Physics', NULL, 'universal', '2026-09-17 18:22:29', '2026-09-17 18:22:29'),
(23, 'Biology', NULL, 'universal', '2026-09-17 18:22:29', '2026-09-17 18:22:29'),
(24, 'Commerce', NULL, 'universal', '2026-09-17 18:22:29', '2026-09-17 18:22:29'),
(25, 'Literature in English', NULL, 'universal', '2026-09-17 18:22:29', '2026-09-17 18:22:29'),
(26, 'Government', NULL, 'universal', '2026-09-17 18:22:29', '2026-09-17 18:22:29'),
(27, 'Chemistry', NULL, 'universal', '2026-09-17 18:22:30', '2026-09-17 18:22:30'),
(28, 'Hausa', NULL, 'universal', '2026-09-17 18:22:30', '2026-09-17 18:22:30'),
(29, 'Computer Science', NULL, 'universal', '2026-09-17 18:22:30', '2026-09-17 18:22:30'),
(30, 'Financial Accounting', NULL, 'universal', '2026-09-17 18:22:30', '2026-09-17 18:22:30'),
(31, 'Further Mathematics', NULL, 'universal', '2026-09-17 18:22:30', '2026-09-17 18:22:30'),
(32, 'Social Studies', NULL, 'universal', '2026-09-17 18:22:30', '2026-09-17 18:22:30'),
(33, 'Business Studies', NULL, 'universal', '2026-09-17 18:22:30', '2026-09-17 18:22:30'),
(34, 'Basic Technology', NULL, 'universal', '2026-09-17 18:22:30', '2026-09-17 18:22:30'),
(35, 'History', NULL, 'universal', '2026-09-17 18:22:31', '2026-09-17 18:22:31');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `active_session` varchar(255) NOT NULL,
  `active_term` varchar(255) NOT NULL,
  `remark_generation_mode` varchar(255) NOT NULL DEFAULT 'manual',
  `result_entry_open` tinyint(1) NOT NULL DEFAULT 1,
  `landing_school_name` varchar(255) DEFAULT NULL,
  `landing_tagline` varchar(255) DEFAULT NULL,
  `landing_hero_title` varchar(255) DEFAULT NULL,
  `landing_hero_desc` text DEFAULT NULL,
  `landing_address` text DEFAULT NULL,
  `result_show_position` tinyint(1) NOT NULL DEFAULT 1,
  `result_show_average` tinyint(1) NOT NULL DEFAULT 1,
  `contact_phone` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `ca1_name` varchar(255) DEFAULT NULL,
  `ca2_name` varchar(255) DEFAULT NULL,
  `ca3_name` varchar(255) DEFAULT NULL,
  `ca4_name` varchar(255) DEFAULT NULL,
  `exam_name` varchar(255) DEFAULT NULL,
  `games_master_name` varchar(255) DEFAULT NULL,
  `games_master_remark` text DEFAULT NULL,
  `house_master_name` varchar(255) DEFAULT NULL,
  `house_master_remark` text DEFAULT NULL,
  `principal_name` varchar(255) DEFAULT NULL,
  `principal_signature` text DEFAULT NULL,
  `next_term_fee` varchar(255) DEFAULT NULL,
  `next_term_fee_nursery` varchar(255) DEFAULT NULL,
  `next_term_fee_primary` varchar(255) DEFAULT NULL,
  `next_term_fee_jss` varchar(255) DEFAULT NULL,
  `next_term_fee_sss` varchar(255) DEFAULT NULL,
  `next_term_begins` varchar(255) DEFAULT NULL,
  `next_term_ends` varchar(255) DEFAULT NULL,
  `last_term_debit` varchar(255) DEFAULT NULL,
  `allow_past_attendance` tinyint(1) NOT NULL DEFAULT 0,
  `allow_fm_register_student` tinyint(1) NOT NULL DEFAULT 0,
  `allow_fm_edit_student` tinyint(1) NOT NULL DEFAULT 0,
  `allow_students_view_sow_status` tinyint(1) NOT NULL DEFAULT 0,
  `max_ca_count` int(11) NOT NULL DEFAULT 4,
  `global_pass_mark` int(11) NOT NULL DEFAULT 40,
  `science_pass_mark` int(11) NOT NULL DEFAULT 60,
  `arts_pass_mark` int(11) NOT NULL DEFAULT 40,
  `commercial_pass_mark` int(11) NOT NULL DEFAULT 50,
  `feature1_icon` varchar(255) DEFAULT NULL,
  `feature1_title` varchar(255) DEFAULT NULL,
  `feature1_desc` text DEFAULT NULL,
  `feature2_icon` varchar(255) DEFAULT NULL,
  `feature2_title` varchar(255) DEFAULT NULL,
  `feature2_desc` text DEFAULT NULL,
  `feature3_icon` varchar(255) DEFAULT NULL,
  `feature3_title` varchar(255) DEFAULT NULL,
  `feature3_desc` text DEFAULT NULL,
  `feature4_icon` varchar(255) DEFAULT NULL,
  `feature4_title` varchar(255) DEFAULT NULL,
  `feature4_desc` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `attendance_location1_lat` decimal(10,8) DEFAULT NULL,
  `attendance_location1_lng` decimal(11,8) DEFAULT NULL,
  `attendance_location2_lat` decimal(10,8) DEFAULT NULL,
  `attendance_location2_lng` decimal(11,8) DEFAULT NULL,
  `attendance_radius` int(11) DEFAULT 100,
  `attendance_location1_name` varchar(255) DEFAULT NULL,
  `attendance_location2_name` varchar(255) DEFAULT NULL,
  `school_logo_path` varchar(255) DEFAULT NULL,
  `about_us_content` longtext DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `ticker_text` varchar(255) DEFAULT NULL,
  `ticker_speed` varchar(255) DEFAULT 'normal',
  `about_us_image_path` varchar(255) DEFAULT NULL,
  `attendance_geofencing_enabled` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `active_session`, `active_term`, `remark_generation_mode`, `result_entry_open`, `landing_school_name`, `landing_tagline`, `landing_hero_title`, `landing_hero_desc`, `landing_address`, `result_show_position`, `result_show_average`, `contact_phone`, `contact_email`, `ca1_name`, `ca2_name`, `ca3_name`, `ca4_name`, `exam_name`, `games_master_name`, `games_master_remark`, `house_master_name`, `house_master_remark`, `principal_name`, `principal_signature`, `next_term_fee`, `next_term_fee_nursery`, `next_term_fee_primary`, `next_term_fee_jss`, `next_term_fee_sss`, `next_term_begins`, `next_term_ends`, `last_term_debit`, `allow_past_attendance`, `allow_fm_register_student`, `allow_fm_edit_student`, `allow_students_view_sow_status`, `max_ca_count`, `global_pass_mark`, `science_pass_mark`, `arts_pass_mark`, `commercial_pass_mark`, `feature1_icon`, `feature1_title`, `feature1_desc`, `feature2_icon`, `feature2_title`, `feature2_desc`, `feature3_icon`, `feature3_title`, `feature3_desc`, `feature4_icon`, `feature4_title`, `feature4_desc`, `created_at`, `updated_at`, `attendance_location1_lat`, `attendance_location1_lng`, `attendance_location2_lat`, `attendance_location2_lng`, `attendance_radius`, `attendance_location1_name`, `attendance_location2_name`, `school_logo_path`, `about_us_content`, `facebook_url`, `twitter_url`, `instagram_url`, `ticker_text`, `ticker_speed`, `about_us_image_path`, `attendance_geofencing_enabled`) VALUES
(1, '2026/2027', '1st Term', 'manual', 1, 'Jere Model Academy', 'Academic Excellence is our Priority', NULL, NULL, 'Opposite Jabal-Annur Mosque, New Abuja Road, Jere Kagarko LGA, Kaduna State.', 1, 1, '+2348037288772', 'info@jeremodelacademy.com.ng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 4, 40, 60, 40, 50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-01 10:50:31', '2026-10-01 17:15:40', NULL, NULL, NULL, NULL, 100, NULL, NULL, 'logos/5yGxW7u5StoLzaJefgtrCCoy7T9p8jHOeFo9e526.jpg', NULL, NULL, NULL, NULL, NULL, 'normal', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `other_names` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `state_of_residence` varchar(255) DEFAULT NULL,
  `lga_of_residence` varchar(255) DEFAULT NULL,
  `signature` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `discipline` varchar(255) DEFAULT NULL,
  `employment_category` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tier_subjects`
--

CREATE TABLE `tier_subjects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tier` varchar(255) NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetables`
--

CREATE TABLE `timetables` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'class',
  `activity` varchar(255) DEFAULT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `day_of_week` varchar(255) NOT NULL,
  `start_time` varchar(255) NOT NULL,
  `end_time` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('admin','teacher','student') NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `passport_photo` longtext DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `must_change_password`, `email`, `full_name`, `role`, `permissions`, `passport_photo`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$VWdhu23OYywEJOOYUdaI1uqEUiVsXXQgbZ5tWK0.lPU2ERCXmGtE.', 0, 'info@jeremodel.com', 'Super Admin', 'admin', '[\"super_admin\"]', NULL, NULL, '2026-07-14 12:23:31', '2026-09-26 16:18:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_sessions`
--
ALTER TABLE `academic_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `academic_sessions_session_name_unique` (`session_name`);

--
-- Indexes for table `account_setup_tokens`
--
ALTER TABLE `account_setup_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_setup_tokens_token_hash_unique` (`token_hash`),
  ADD KEY `account_setup_tokens_user_id_expires_at_index` (`user_id`,`expires_at`);

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_user_role_created_at_index` (`user_role`,`created_at`),
  ADD KEY `activity_logs_module_created_at_index` (`module`,`created_at`),
  ADD KEY `activity_logs_action_created_at_index` (`action`,`created_at`),
  ADD KEY `activity_logs_user_id_index` (`user_id`);

--
-- Indexes for table `affective_skills`
--
ALTER TABLE `affective_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `affective_skills_name_target_section_unique` (`name`,`target_section`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `classes_name_unique` (`name`),
  ADD KEY `classes_form_master_id_foreign` (`form_master_id`);

--
-- Indexes for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `class_subjects_class_id_subject_id_unique` (`class_id`,`subject_id`),
  ADD KEY `class_subjects_subject_id_foreign` (`subject_id`),
  ADD KEY `class_subjects_teacher_id_foreign` (`teacher_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `fee_invoices`
--
ALTER TABLE `fee_invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fee_invoices_student_id_title_unique` (`student_id`,`title`);

--
-- Indexes for table `fee_structures`
--
ALTER TABLE `fee_structures`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `grades_student_id_subject_id_term_academic_year_unique` (`student_id`,`subject_id`,`term`,`academic_year`),
  ADD KEY `grades_subject_id_foreign` (`subject_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `promoted_classes`
--
ALTER TABLE `promoted_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `promoted_classes_class_id_session_name_unique` (`class_id`,`session_name`);

--
-- Indexes for table `psychomotor_skills`
--
ALTER TABLE `psychomotor_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `psychomotor_skills_name_target_section_unique` (`name`,`target_section`);

--
-- Indexes for table `report_card_remarks`
--
ALTER TABLE `report_card_remarks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `report_card_remarks_student_id_term_academic_year_unique` (`student_id`,`term`,`academic_year`);

--
-- Indexes for table `result_pins`
--
ALTER TABLE `result_pins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `result_pins_pin_unique` (`pin`),
  ADD KEY `result_pins_student_id_foreign` (`student_id`);

--
-- Indexes for table `result_publications`
--
ALTER TABLE `result_publications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `result_publications_student_term_year_unique` (`student_id`,`term`,`academic_year`),
  ADD KEY `result_publications_published_by_foreign` (`published_by`),
  ADD KEY `result_publications_term_academic_year_index` (`term`,`academic_year`);

--
-- Indexes for table `result_publication_events`
--
ALTER TABLE `result_publication_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `result_publication_events_student_id_foreign` (`student_id`),
  ADD KEY `result_publication_events_performed_by_foreign` (`performed_by`),
  ADD KEY `result_publication_events_term_year_time_index` (`term`,`academic_year`,`performed_at`);

--
-- Indexes for table `scheme_of_works`
--
ALTER TABLE `scheme_of_works`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scheme_of_works_subject_id_foreign` (`subject_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `slides`
--
ALTER TABLE `slides`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sow_progress`
--
ALTER TABLE `sow_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sow_progress_scheme_of_work_id_foreign` (`scheme_of_work_id`),
  ADD KEY `sow_progress_class_id_foreign` (`class_id`),
  ADD KEY `sow_progress_teacher_id_foreign` (`teacher_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `students_admission_number_unique` (`admission_number`),
  ADD KEY `students_class_id_foreign` (`class_id`);

--
-- Indexes for table `student_affective_eval`
--
ALTER TABLE `student_affective_eval`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `affective_eval_unique` (`student_id`,`skill_id`,`term`,`academic_year`),
  ADD KEY `student_affective_eval_skill_id_foreign` (`skill_id`);

--
-- Indexes for table `student_psychomotor_eval`
--
ALTER TABLE `student_psychomotor_eval`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `psycho_eval_unique` (`student_id`,`skill_id`,`term`,`academic_year`),
  ADD KEY `student_psychomotor_eval_skill_id_foreign` (`skill_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subjects_name_unique` (`name`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tier_subjects`
--
ALTER TABLE `tier_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tier_subjects_tier_subject_id_unique` (`tier`,`subject_id`),
  ADD KEY `tier_subjects_subject_id_foreign` (`subject_id`);

--
-- Indexes for table `timetables`
--
ALTER TABLE `timetables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timetables_class_id_foreign` (`class_id`),
  ADD KEY `timetables_subject_id_foreign` (`subject_id`),
  ADD KEY `timetables_teacher_id_foreign` (`teacher_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_sessions`
--
ALTER TABLE `academic_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `account_setup_tokens`
--
ALTER TABLE `account_setup_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `affective_skills`
--
ALTER TABLE `affective_skills`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `class_subjects`
--
ALTER TABLE `class_subjects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_invoices`
--
ALTER TABLE `fee_invoices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_structures`
--
ALTER TABLE `fee_structures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `promoted_classes`
--
ALTER TABLE `promoted_classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `psychomotor_skills`
--
ALTER TABLE `psychomotor_skills`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `report_card_remarks`
--
ALTER TABLE `report_card_remarks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_pins`
--
ALTER TABLE `result_pins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_publications`
--
ALTER TABLE `result_publications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_publication_events`
--
ALTER TABLE `result_publication_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scheme_of_works`
--
ALTER TABLE `scheme_of_works`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `slides`
--
ALTER TABLE `slides`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sow_progress`
--
ALTER TABLE `sow_progress`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_affective_eval`
--
ALTER TABLE `student_affective_eval`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_psychomotor_eval`
--
ALTER TABLE `student_psychomotor_eval`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tier_subjects`
--
ALTER TABLE `tier_subjects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetables`
--
ALTER TABLE `timetables`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_setup_tokens`
--
ALTER TABLE `account_setup_tokens`
  ADD CONSTRAINT `account_setup_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_form_master_id_foreign` FOREIGN KEY (`form_master_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD CONSTRAINT `class_subjects_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_subjects_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_subjects_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `fee_invoices`
--
ALTER TABLE `fee_invoices`
  ADD CONSTRAINT `fee_invoices_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `report_card_remarks`
--
ALTER TABLE `report_card_remarks`
  ADD CONSTRAINT `report_card_remarks_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `result_pins`
--
ALTER TABLE `result_pins`
  ADD CONSTRAINT `result_pins_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `result_publications`
--
ALTER TABLE `result_publications`
  ADD CONSTRAINT `result_publications_published_by_foreign` FOREIGN KEY (`published_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `result_publications_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `result_publication_events`
--
ALTER TABLE `result_publication_events`
  ADD CONSTRAINT `result_publication_events_performed_by_foreign` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `result_publication_events_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `scheme_of_works`
--
ALTER TABLE `scheme_of_works`
  ADD CONSTRAINT `scheme_of_works_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sow_progress`
--
ALTER TABLE `sow_progress`
  ADD CONSTRAINT `sow_progress_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sow_progress_scheme_of_work_id_foreign` FOREIGN KEY (`scheme_of_work_id`) REFERENCES `scheme_of_works` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sow_progress_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_id_foreign` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_affective_eval`
--
ALTER TABLE `student_affective_eval`
  ADD CONSTRAINT `student_affective_eval_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `affective_skills` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_affective_eval_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_psychomotor_eval`
--
ALTER TABLE `student_psychomotor_eval`
  ADD CONSTRAINT `student_psychomotor_eval_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `psychomotor_skills` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_psychomotor_eval_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_id_foreign` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tier_subjects`
--
ALTER TABLE `tier_subjects`
  ADD CONSTRAINT `tier_subjects_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timetables`
--
ALTER TABLE `timetables`
  ADD CONSTRAINT `timetables_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetables_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetables_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
