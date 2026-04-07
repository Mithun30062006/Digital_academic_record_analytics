-- Database setup script for students
CREATE DATABASE IF NOT EXISTS mini_project;
USE mini_project;

CREATE TABLE IF NOT EXISTS students_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    batch VARCHAR(100),
    semester VARCHAR(20),
    department VARCHAR(255),
    year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
