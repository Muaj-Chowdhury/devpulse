
import express, { type Application } from 'express';
import { authRoute } from './modules/auth/auth.route';
import cookieParser from 'cookie-parser';
import { issueRoutes } from './modules/issues/issue.route';

const app : Application = express();

/* User Registration
Access: Public

Description: Register a new user account with contributor or maintainer role

Endpoint

POST /api/auth/signup */

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoutes);
export default app;