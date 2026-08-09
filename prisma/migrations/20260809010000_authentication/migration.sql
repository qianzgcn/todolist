-- Keep the existing todo data while making ownership and authentication reproducible.
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @add_category_user_column = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `Category` ADD COLUMN `userId` VARCHAR(191) NULL',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'Category'
      AND column_name = 'userId'
);
PREPARE add_category_user_column FROM @add_category_user_column;
EXECUTE add_category_user_column;
DEALLOCATE PREPARE add_category_user_column;

SET @add_todo_user_column = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `Todo` ADD COLUMN `userId` VARCHAR(191) NULL',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'Todo'
      AND column_name = 'userId'
);
PREPARE add_todo_user_column FROM @add_todo_user_column;
EXECUTE add_todo_user_column;
DEALLOCATE PREPARE add_todo_user_column;

SET @drop_category_name_key = (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE `Category` DROP INDEX `Category_name_key`',
        'SELECT 1'
    )
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'Category'
      AND index_name = 'Category_name_key'
);
PREPARE drop_category_name_key FROM @drop_category_name_key;
EXECUTE drop_category_name_key;
DEALLOCATE PREPARE drop_category_name_key;

SET @create_category_owner_key = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `Category` ADD UNIQUE INDEX `Category_userId_name_key`(`userId`, `name`)',
        'SELECT 1'
    )
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'Category'
      AND index_name = 'Category_userId_name_key'
);
PREPARE create_category_owner_key FROM @create_category_owner_key;
EXECUTE create_category_owner_key;
DEALLOCATE PREPARE create_category_owner_key;

-- Prebuilt administrator: admin / admin123456. Change it after first login.
INSERT INTO `User` (`id`, `username`, `password`, `role`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'admin',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeiuUSrjtoE8RcSM37yqdpV2Q1U7bNcWa',
    'ADMIN',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
)
ON DUPLICATE KEY UPDATE `role` = 'ADMIN';

SET @admin_id = (SELECT `id` FROM `User` WHERE `username` = 'admin' LIMIT 1);
UPDATE `Category` SET `userId` = @admin_id WHERE `userId` IS NULL;
UPDATE `Todo` SET `userId` = @admin_id WHERE `userId` IS NULL;

ALTER TABLE `Category`
    MODIFY COLUMN `userId` VARCHAR(191) NOT NULL;

ALTER TABLE `Todo`
    MODIFY COLUMN `userId` VARCHAR(191) NOT NULL;

SET @add_category_user_fk = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
        'SELECT 1'
    )
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'Category'
      AND constraint_name = 'Category_userId_fkey'
);
PREPARE add_category_user_fk FROM @add_category_user_fk;
EXECUTE add_category_user_fk;
DEALLOCATE PREPARE add_category_user_fk;

SET @add_todo_user_fk = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `Todo` ADD CONSTRAINT `Todo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
        'SELECT 1'
    )
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'Todo'
      AND constraint_name = 'Todo_userId_fkey'
);
PREPARE add_todo_user_fk FROM @add_todo_user_fk;
EXECUTE add_todo_user_fk;
DEALLOCATE PREPARE add_todo_user_fk;
