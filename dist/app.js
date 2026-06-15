import express, {} from 'express';
import { authRoute } from './modules/auth/auth.route';
import cookieParser from 'cookie-parser';
import { issueRoutes } from './modules/issues/issue.route';
const app = express();
/* User Registration
Access: Public

Description: Register a new user account with contributor or maintainer role

Endpoint

POST /api/auth/signup */
app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res) => {
    res.send('Welcome to the DevPulse API!');
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoutes);
export default app;
//# sourceMappingURL=app.js.map