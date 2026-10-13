CREATE TABLE IF NOT EXISTS attendance (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `marked_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY attendance_student_id_date_unique (`student_id`, `date`),
    KEY attendance_date_index (`date`),
    KEY attendance_marked_by_foreign (`marked_by`),
    CONSTRAINT attendance_student_id_foreign FOREIGN KEY (`student_id`) REFERENCES students (`id`) ON DELETE CASCADE,
    CONSTRAINT attendance_marked_by_foreign FOREIGN KEY (`marked_by`) REFERENCES users (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
