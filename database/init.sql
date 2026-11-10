-- ==============================================================
-- EVChargeHub - PostgreSQL Database Initialization Script
-- ==============================================================
-- Run this script to create the database.
-- After creating the database, Spring Boot + Hibernate will
-- automatically create all the tables from the entity classes.
-- ==============================================================

-- Step 1: Create the database (run this in psql or pgAdmin)
CREATE DATABASE evchargehub;

-- Step 2: (Optional) Create a dedicated user instead of using "postgres"
-- CREATE USER evchargehub_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE evchargehub TO evchargehub_user;

-- ==============================================================
-- NOTE: You do NOT need to create tables manually.
-- Spring Boot with "ddl-auto: update" in application.yml will
-- automatically create these tables when the application starts:
--
--   users       — registered users (EV users and station providers)
--   vehicles    — electric vehicles registered by users
--   stations    — EV charging stations
--   chargers    — individual charging points at stations
--   bookings    — charging slot reservations
--   facilities  — amenities at stations (Wi-Fi, Restroom, etc.)
--
-- All foreign keys, constraints, and indexes are created automatically
-- from the JPA entity annotations.
-- ==============================================================

