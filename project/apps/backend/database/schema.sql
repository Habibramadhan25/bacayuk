-- ============================================================
-- BacaYuk - MySQL Database Schema & Seed Data
-- Khusus untuk bagian database (MySQL)
-- Database: bacayuk_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS `bacayuk_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `bacayuk_db`;

SET NAMES utf8mb4;
SET time_zone = '+07:00';
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Admins (akun pengelola/admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL DEFAULT 'Administrator',
  `email` VARCHAR(150) DEFAULT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Super Admin',
  `avatar_url` LONGTEXT DEFAULT NULL,
  `timezone` VARCHAR(20) NOT NULL DEFAULT 'WIB',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Students (akun anggota/siswa)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `school` VARCHAR(150) DEFAULT 'Sekolah',
  `avatar_url` LONGTEXT DEFAULT NULL,
  `join_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `books_read` INT NOT NULL DEFAULT 0,
  `books_completed` INT NOT NULL DEFAULT 0,
  `status` ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_students_username` (`username`),
  KEY `idx_students_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `book_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Books
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `books` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `year` INT DEFAULT NULL,
  `publisher` VARCHAR(150) DEFAULT NULL,
  `isbn` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('Published','Draft') NOT NULL DEFAULT 'Draft',
  `rating` DECIMAL(3,1) NOT NULL DEFAULT 0.0,
  `readers` INT NOT NULL DEFAULT 0,
  `date_added` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cover_url` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_books_status` (`status`),
  KEY `idx_books_category` (`category`),
  KEY `idx_books_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Reading history / progress
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reading_history` (
  `id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) DEFAULT NULL,
  `book_id` VARCHAR(50) NOT NULL,
  `book_title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(150) DEFAULT NULL,
  `cover_url` TEXT DEFAULT NULL,
  `progress` INT NOT NULL DEFAULT 0,
  `current_page` INT NOT NULL DEFAULT 0,
  `total_pages` INT NOT NULL DEFAULT 0,
  `last_read` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Sedang Dibaca',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_history_student` (`student_id`),
  KEY `idx_history_book` (`book_id`),
  KEY `idx_history_last_read` (`last_read`),
  CONSTRAINT `fk_history_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_history_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Reviews / ratings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(50) NOT NULL,
  `book_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) DEFAULT NULL,
  `reviewer_name` VARCHAR(150) NOT NULL,
  `rating` INT NOT NULL,
  `text` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_book` (`book_id`),
  KEY `idx_reviews_student` (`student_id`),
  CONSTRAINT `fk_reviews_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Favorites
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `book_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_favorites_student_book` (`student_id`,`book_id`),
  KEY `idx_favorites_student` (`student_id`),
  KEY `idx_favorites_book` (`book_id`),
  CONSTRAINT `fk_favorites_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorites_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(80) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('book','category','user','system') NOT NULL DEFAULT 'system',
  `audience` ENUM('admin','siswa','all') NOT NULL DEFAULT 'all',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_by_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `read_by_siswa` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_audience` (`audience`),
  KEY `idx_notifications_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Activity logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` VARCHAR(50) NOT NULL,
  `actor` VARCHAR(150) NOT NULL,
  `action` VARCHAR(150) NOT NULL,
  `target` VARCHAR(255) NOT NULL,
  `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('Success','Warning','Error') NOT NULL DEFAULT 'Success',
  PRIMARY KEY (`id`),
  KEY `idx_activity_time` (`time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Seed Data
-- ============================================================

-- Default admin (username: admin, password: admin123)
INSERT INTO `admins` (`id`, `username`, `password_hash`, `name`, `email`, `role`, `avatar_url`, `timezone`)
VALUES ('admin1', 'admin', 'bffbe0b84b2bd4d3e513f2c5aa44833aa5617f12f0845405e3c875ac3775a273', 'Administrator Utama', 'admin@bacayuk.id', 'Super Admin', NULL, 'WIB')
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`);

-- Categories
INSERT INTO `categories` (`id`, `name`, `book_count`) VALUES
('1', 'Novel', 45),
('2', 'Pendidikan', 120),
('3', 'Teknologi', 85),
('4', 'Komik', 230),
('5', 'Sejarah', 34),
('6', 'Agama', 60),
('7', 'Cerita Anak', 150),
('8', 'Fiksi', 205),
('9', 'Nonfiksi', 95)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `book_count`=VALUES(`book_count`);

-- Books
INSERT INTO `books` (`id`, `title`, `author`, `category`, `year`, `publisher`, `isbn`, `status`, `rating`, `readers`, `date_added`, `cover_url`, `description`) VALUES
('b1', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Fiksi', 1980, 'Hasta Mitra', '9789799731234', 'Published', 4.8, 1250, '2023-01-15 10:00:00', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300', 'Bumi Manusia adalah buku pertama dari Tetralogi Buru karya Pramoedya Ananta Toer.'),
('b2', 'Laskar Pelangi', 'Andrea Hirata', 'Fiksi', 2005, 'Bentang Pustaka', '9789793062792', 'Published', 4.9, 3400, '2023-02-20 14:30:00', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300', 'Buku pertama dari Tetralogi Laskar Pelangi, menceritakan kisah 10 anak Belitung.'),
('b3', 'Sapiens: Riwayat Singkat Umat Manusia', 'Yuval Noah Harari', 'Sejarah', 2011, 'KPG', '9786024242784', 'Published', 4.7, 890, '2023-05-10 09:15:00', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=300', 'Eksplorasi sejarah umat manusia dari zaman batu hingga abad ke-21.'),
('b4', 'Atomic Habits', 'James Clear', 'Nonfiksi', 2018, 'Gramedia', '9786020633176', 'Published', 4.9, 5200, '2023-08-05 11:45:00', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300', 'Cara mudah dan terbukti untuk membentuk kebiasaan baik dan menghilangkan kebiasaan buruk.'),
('b5', 'Filosofi Teras', 'Henry Manampiring', 'Nonfiksi', 2018, 'Penerbit Buku Kompas', '9786024125186', 'Published', 4.8, 2100, '2023-11-12 16:20:00', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=300', 'Pengantar filsafat Stoa (Stoikisme) untuk kehidupan masa kini yang lebih damai.'),
('b6', 'Cantik Itu Luka', 'Eka Kurniawan', 'Fiksi', 2002, 'Gramedia Pustaka Utama', '9786020312583', 'Published', 4.6, 1750, '2024-01-20 08:00:00', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=300', 'Novel epik pemenang berbagai penghargaan tentang sejarah kolonialisme.'),
('b7', 'Pulang', 'Tere Liye', 'Novel', 2015, 'Republika', '9786020822129', 'Published', 4.8, 4500, '2024-02-10 10:00:00', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300', 'Kisah tentang perjalanan menemukan arti sejati dari pulang.'),
('b8', 'Gadis Kretek', 'Ratih Kumala', 'Fiksi', 2012, 'Gramedia', '9789792281415', 'Published', 4.7, 3100, '2024-02-15 09:00:00', 'https://images.unsplash.com/photo-1524578964522-6321288b83ac?auto=format&fit=crop&q=80&w=300', 'Menelusuri jejak industri kretek Nusantara lewat kisah cinta masa lalu.'),
('b9', 'Hujan', 'Tere Liye', 'Novel', 2016, 'Gramedia', '9786020324784', 'Published', 4.6, 5600, '2024-03-01 14:00:00', 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=300', 'Tentang persahabatan, cinta, melupakan, dan hujan.'),
('b10', 'Dunia Sophie', 'Jostein Gaarder', 'Pendidikan', 1991, 'Mizan', '9789794335550', 'Published', 4.8, 2900, '2024-03-10 11:30:00', 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=300', 'Sebuah novel sejarah filsafat yang dibalut dalam cerita misteri.'),
('b11', 'Tetralogi Buru: Anak Semua Bangsa', 'Pramoedya Ananta Toer', 'Sejarah', 1980, 'Hasta Mitra', '9789799731241', 'Published', 4.9, 1800, '2024-03-20 08:15:00', 'https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?auto=format&fit=crop&q=80&w=300', 'Lanjutan dari Bumi Manusia yang mengeksplorasi perlawanan terhadap kolonialisme.'),
('b12', 'Ronggeng Dukuh Paruk', 'Ahmad Tohari', 'Fiksi', 1982, 'Gramedia', '9789792277289', 'Published', 4.7, 2200, '2024-04-05 13:45:00', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300', 'Tragedi kehidupan penari ronggeng di tengah pergolakan sosial-politik.'),
('b13', 'Negeri 5 Menara', 'A. Fuadi', 'Novel', 2009, 'Gramedia', '9789792248616', 'Published', 4.6, 4100, '2024-04-12 10:20:00', 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=300', 'Man jadda wajada. Siapa yang bersungguh-sungguh, pasti berhasil.'),
('b14', 'Garis Waktu', 'Fiersa Besari', 'Fiksi', 2016, 'Mediakita', '9789797945251', 'Published', 4.5, 3800, '2024-04-18 16:00:00', 'https://images.unsplash.com/photo-1506880018603-83d5b62f40c4?auto=format&fit=crop&q=80&w=300', 'Sebuah perjalanan menghapus luka.'),
('b15', 'The Psychology of Money', 'Morgan Housel', 'Nonfiksi', 2020, 'Penerbit Baca', '9786026486586', 'Published', 4.8, 6700, '2024-05-02 09:30:00', 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=300', 'Pelajaran abadi mengenai kekayaan, ketamakan, dan kebahagiaan.'),
('b16', 'Perahu Kertas', 'Dee Lestari', 'Novel', 2009, 'Bentang Pustaka', '9789791227780', 'Published', 4.7, 4200, '2024-05-15 14:15:00', 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&q=80&w=300', 'Kisah tentang impian, persahabatan, dan cinta yang tak terduga.'),
('b17', 'Supernova: Kesatria, Putri, dan Bintang Jatuh', 'Dee Lestari', 'Fiksi', 2001, 'Truedee Books', '9789799625700', 'Published', 4.6, 2500, '2024-05-20 11:00:00', 'https://images.unsplash.com/photo-1505682614136-0a12f9f7beea?auto=format&fit=crop&q=80&w=300', 'Bagian pertama dari seri Supernova yang menggabungkan romansa dan sains.'),
('b18', 'Laut Bercerita', 'Leila S. Chudori', 'Sejarah', 2017, 'Kepustakaan Populer Gramedia', '9786024246942', 'Published', 4.9, 8100, '2024-06-05 08:30:00', 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&q=80&w=300', 'Menyuarakan mereka yang hilang dalam sejarah kelam Indonesia.'),
('b19', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Pendidikan', 2011, 'Gramedia', '9786020637174', 'Published', 4.7, 3400, '2024-06-12 15:45:00', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300', 'Mengupas dua sistem berpikir yang mengendalikan cara kita mengambil keputusan.'),
('b20', 'Bumi', 'Tere Liye', 'Cerita Anak', 2014, 'Gramedia', '9786020301129', 'Published', 4.8, 5900, '2024-06-25 10:10:00', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300', 'Petualangan Raib di dunia paralel yang menyimpan banyak misteri.'),
('b21', 'Si Anak Singkong', 'Chairul Tanjung', 'Nonfiksi', 2012, 'Kompas', '9789797096502', 'Draft', 0.0, 0, '2024-07-01 12:00:00', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300', 'Biografi perjalanan hidup pengusaha Chairul Tanjung.')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Students (members)
INSERT INTO `students` (`id`, `username`, `name`, `email`, `password_hash`, `school`, `avatar_url`, `join_date`, `books_read`, `books_completed`, `status`) VALUES
('u1', 'budisantoso', 'Budi Santoso', 'budi.santoso@email.com', NULL, 'Sekolah', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80', '2023-01-10 08:00:00', 15, 12, 'Active'),
('u2', 'sitiaminah', 'Siti Aminah', 'siti.aminah@email.com', NULL, 'Sekolah', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', '2023-03-15 14:30:00', 42, 38, 'Active'),
('u3', 'andiwiryawan', 'Andi Wiryawan', 'andi.w@email.com', NULL, 'Sekolah', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', '2023-06-20 09:15:00', 5, 2, 'Active'),
('u4', 'rinakartika', 'Rina Kartika', 'rina.kar@email.com', NULL, 'Sekolah', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', '2023-08-05 11:45:00', 28, 20, 'Inactive'),
('u5', 'dewilestari', 'Dewi Lestari', 'dewi.l@email.com', NULL, 'Sekolah', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', '2023-11-12 16:20:00', 56, 50, 'Active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Reading history (initial sample, not tied to specific student_id)
INSERT INTO `reading_history` (`id`, `student_id`, `book_id`, `book_title`, `author`, `cover_url`, `progress`, `current_page`, `total_pages`, `last_read`, `status`) VALUES
('h1', NULL, 'b1', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300', 45, 135, 300, DATE_SUB(NOW(), INTERVAL 30 MINUTE), 'Sedang Dibaca'),
('h2', NULL, 'b4', 'Atomic Habits', 'James Clear', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300', 100, 320, 320, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Selesai'),
('h3', NULL, 'b3', 'Sapiens', 'Yuval Noah Harari', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=300', 12, 50, 416, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Sedang Dibaca')
ON DUPLICATE KEY UPDATE `book_title`=VALUES(`book_title`);

-- Activity logs
INSERT INTO `activity_logs` (`id`, `actor`, `action`, `target`, `time`, `status`) VALUES
('a1', 'Siti Aminah', 'Mendaftar', 'Akun Baru', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 'Success'),
('a2', 'Budi Santoso', 'Menyelesaikan', 'Buku: Atomic Habits', DATE_SUB(NOW(), INTERVAL 45 MINUTE), 'Success'),
('a3', 'Andi Wiryawan', 'Gagal Login', 'Sistem', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'Error'),
('a4', 'Admin', 'Menambahkan', 'Buku: Filosofi Teras', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Success'),
('a5', 'Rina Kartika', 'Membaca', 'Buku: Bumi Manusia', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Success')
ON DUPLICATE KEY UPDATE `actor`=VALUES(`actor`);
