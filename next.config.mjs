import dotenv from 'dotenv';
import path from 'path';

// Load env vars from app/.env as requested
dotenv.config({ path: path.resolve(process.cwd(), 'app', '.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
