import { neon } from "@neondatabase/serverless";
import config from "../config";

export const sql = neon(config.database_url);

/*
🗄️ Database Schema Design
Table 1: users
Field	Requirement (Plain Text)
id	Auto-incrementing unique identifier for each account
name	Full display name of the team member, must be provided
email	Valid login address, must be unique across all accounts, must be provided
password	Encrypted string stored securely, must be provided during registration, never returned in responses
role	Determines system access level, defaults to contributor, must be contributor or maintainer
created_at	Timestamp marking when the account was created, automatically generated on insert
updated_at	Timestamp marking when the account was last updated, automatically refreshed on update
Table 2: issues
Field	Requirement (Plain Text)
id	Auto-incrementing unique identifier for each reported item
title	Short descriptive headline, must be provided, maximum 150 characters
description	Detailed explanation of the problem or suggestion, must be provided, minimum 20 characters
type	Categorizes the entry, must be either bug or feature_request
status	Current workflow state, defaults to open. Status must be one of: open, in_progress, resolved
reporter_id	References the user who submitted the issue (no foreign key constraint required; validate in application logic)
created_at	Timestamp marking when the issue was created, automatically generated on insert
updated_at	Timestamp marking when the issue was last updated, automatically refreshed on update */

export const initDB = async () => {
  await sql`
   CREATE TABLE IF NOT EXISTS users (
   id SERIAL PRIMARY KEY,
   name VARCHAR(100) NOT NULL,
   email VARCHAR(255) NOT NULL UNIQUE,
   password_hash TEXT NOT NULL,
   role VARCHAR(20) NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
   )
   `;
  await sql`
 CREATE TABLE IF NOT EXISTS issues (
 id SERIAL PRIMARY KEY,
 title VARCHAR(150) NOT NULL,
 description TEXT NOT NULL,
 type VARCHAR(20) NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'open',
 reporter_id INTEGER NOT NULL, -- Foreign key constraint removed per prompt instructions
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW()
 )
`;
};
