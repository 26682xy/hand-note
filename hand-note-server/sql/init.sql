CREATE DATABASE IF NOT EXISTS hand_note_db DEFAULT CHARACTER SET utf8mb4;
USE hand_note_db;
-- 用户表
CREATE TABLE `users` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(60) NOT NULL UNIQUE,
  password VARCHAR(120) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 手账画布保存表，新增 note_date 记录这份手账所属日期
CREATE TABLE `notebooks` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(120),
  canvas_height INT,
  canvas_items LONGTEXT, -- JSON字符串保存画布所有元素
  note_date DATE NULL COMMENT '手账所属日期，用于打卡UI渲染',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========新增：首页用户临时画布存储表=========
CREATE TABLE `home_user_canvas` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE COMMENT '一个用户仅一条记录',
  canvas_list LONGTEXT COMMENT 'JSON存储tmpCanvasList数组',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 用户上传贴纸表
CREATE TABLE `user_stickers` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  file_url VARCHAR(250),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE `user_checkin_record` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户id',
  check_date DATE NOT NULL COMMENT '打卡日期 yyyy‑mm‑dd',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_date (user_id, check_date),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
