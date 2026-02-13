-- Migration: add password_hash to students table (run manually if needed)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL AFTER email;
