import dotenv from 'dotenv';
dotenv.config({ quiet: true });
const config = {
    port: process.env.PORT || 5000,
    database_url: process.env.DATABASE_URL || '',
    node_env: process.env.NODE_ENV || 'development',
    jwt_secret: process.env.JWT_SECRET || 'default_secret_key',
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret_key'
};
export default config;
//# sourceMappingURL=index.js.map