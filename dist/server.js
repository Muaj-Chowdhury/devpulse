
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/db/index.ts
import { neon } from "@neondatabase/serverless";

// src/config/index.ts
import dotenv from "dotenv";
dotenv.config({ quiet: true });
var config = {
  port: process.env.PORT || 5e3,
  database_url: process.env.DATABASE_URL || "",
  node_env: process.env.NODE_ENV || "development",
  jwt_secret: process.env.JWT_SECRET || "default_secret_key",
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret_key"
};
var config_default = config;

// src/db/index.ts
var sql = neon(config_default.database_url);
var initDB = async () => {
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

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
var AuthService = class {
  async hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }
  async createUser(user) {
    const { name, email, role, password } = user;
    const passwordHash = await this.hashPassword(password);
    const newUser = await sql`
            INSERT INTO users (name, email, role, password_hash)
            VALUES (${name}, ${email}, COALESCE(${role}, 'contributor') , ${passwordHash})
            RETURNING id, name, email, role, created_at, updated_at 
        `;
    return newUser[0];
  }
  async validateUser(email, password) {
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    if (!users || users.length === 0) return null;
    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
  async getUserById(userId) {
    const result = await sql`
    SELECT id, name, email, role, created_at, updated_at
    FROM users
    WHERE id = ${userId}
  `;
    if (!result || result.length === 0) {
      return null;
    }
    return result[0];
  }
};
var auth_service_default = new AuthService();

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/utils/signToken.ts
import jwt from "jsonwebtoken";
var signToken = (payload) => {
  const accessToken = jwt.sign(payload, config_default.jwt_secret, {
    expiresIn: "1d"
  });
  const refreshToken = jwt.sign(
    payload,
    config_default.refresh_token_secret,
    {
      expiresIn: "15d"
    }
  );
  return { accessToken, refreshToken };
};
var verifyToken = (token, type) => {
  const secret = type === "access" ? config_default.jwt_secret : config_default.refresh_token_secret;
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
};

// src/modules/auth/auth.controller.ts
var signUp = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await auth_service_default.createUser({ name, email, password, role });
    if (!user) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "User registration failed"
      });
    }
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully!",
      data: user
    });
  } catch (error) {
    next(error);
  }
};
var login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await auth_service_default.validateUser(email, password);
  if (!user) {
    return sendResponse_default(res, {
      statusCode: 401,
      success: false,
      message: "Invalid email or password"
    });
  }
  const { accessToken: token, refreshToken } = signToken({
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax"
  });
  return sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "login successful",
    data: {
      token,
      user
    }
  });
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", signUp);
router.post("/login", login);
var authRoute = router;

// src/app.ts
import cookieParser from "cookie-parser";

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/middlewares/auth.ts
var auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized"
      });
    }
    const payload = verifyToken(token, "access");
    if (!payload) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Invalid token"
      });
    }
    const user = await auth_service_default.getUserById(payload.id);
    if (!user) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found"
      });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
var authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized"
      });
    }
    if (!roles.includes(req.user.role)) {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden Access"
      });
    }
    next();
  };
};

// src/errors/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
};

// src/modules/issues/issue.service.ts
var IssueService = class {
  async createIssueIntoDB(payload) {
    const { title, description, type, reporter_id } = payload;
    const result = await sql`
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES (${title}, ${description}, ${type}, ${reporter_id})
      RETURNING id, title, description, type , status, reporter_id, created_at, updated_at
      `;
    return result[0];
  }
  async getAllIssuesFromDB(filters) {
    const { type, status, sort = "newest" } = filters;
    let query = sql`
    SELECT id , title , description, type , status, reporter_id, created_at, updated_at FROM issues WHERE 1=1`;
    if (type) {
      query = sql`${query} AND type = ${type}`;
    }
    if (status) {
      query = sql`${query} AND status = ${status}`;
    }
    if (sort === "oldest") {
      query = sql`${query} ORDER BY created_at ASC`;
    } else {
      query = sql`${query} ORDER BY created_at DESC`;
    }
    const issues = await query;
    if (issues.length === 0) return [];
    const reporterIds = Array.from(
      new Set(issues.map((issue) => issue.reporter_id))
    );
    console.log(reporterIds);
    const reporters = await sql`
    SELECT id , name ,role FROM users WHERE id = ANY(${reporterIds})`;
    const reportersMap = reporters.reduce(
      (acc, reporter) => {
        acc[reporter.id] = reporter;
        return acc;
      },
      {}
    );
    const stitchedIssues = issues.map((issue) => {
      const { reporter_id, ...issueData } = issue;
      return {
        ...issueData,
        reporter: reportersMap[reporter_id] || {
          id: reporter_id,
          name: "Unknown User",
          role: "contributor"
        }
      };
    });
    return stitchedIssues;
  }
  async getSingleIssueFromDB(id) {
    const IssueResult = await sql`
    SELECT id , title , description,type, status,reporter_id ,created_at , updated_at
    FROM issues
    WHERE id = ${id}`;
    if (!IssueResult || IssueResult.length === 0) {
      return null;
    }
    const issue = IssueResult[0];
    const reporterResult = await sql`
    SELECT id , name , role
    FROM users
    WHERE id = ${issue.reporter_id}`;
    const { reporter_id, ...issueData } = issue;
    return {
      ...issueData,
      reporter: reporterResult.length ? reporterResult[0] : {
        id: reporter_id,
        name: "Unknown user",
        role: "contributor"
      }
    };
  }
  async getIssueByIdFromDB(id) {
    const result = await sql`
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      WHERE id = ${id}
    `;
    return result.length === 0 ? null : result[0];
  }
  async UpdateIssueInDB(id, payload) {
    const { title, description, type } = payload;
    const result = await sql`
    UPDATE issues
    SET
    title = COALESCE(${title} , title),
    description = COALESCE(${description} , description),
    type = COALESCE(${type}, type),
    updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;
    return result.length === 0 ? null : result[0];
  }
  async deleteIssueFromDB(id) {
    const result = await sql`
      DELETE FROM issues WHERE id = ${id}
      RETURNING id;
    `;
    return result.length > 0;
  }
};
var issue_service_default = new IssueService();

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError(401, "Authentication required to report issues.");
    }
    const { title, description, type } = req.body;
    const newIssue = await issue_service_default.createIssueIntoDB({
      title,
      description,
      type,
      reporter_id: Number(req.user.id)
    });
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "issue created successfully",
      data: newIssue
    });
  } catch (error) {
    next(error);
  }
};
var getAllIssues = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.type) {
      filters.type = req.query.type;
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }
    filters.sort = req.query.sort || "newest";
    const result = await issue_service_default.getAllIssuesFromDB(filters);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getSingleIssue = async (req, res, next) => {
  try {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
      throw new AppError(400, "Invalid issue ID format.");
    }
    const result = await issue_service_default.getSingleIssueFromDB(issueId);
    if (!result) {
      throw new AppError(404, "Issue not found.");
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateIssue = async (req, res, next) => {
  try {
    const issueId = Number(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new AppError(401, "Authentication required");
    }
    const issue = await issue_service_default.getIssueByIdFromDB(issueId);
    if (!issue) {
      throw new AppError(404, "Issue not found");
    }
    const isMaintainer = userRole === "maintainer";
    const isOwner = issue.reporter_id === userId;
    const isStatusOpen = issue.status === "open";
    const hasPermission = isMaintainer || isOwner && isStatusOpen;
    if (!hasPermission) {
      throw new AppError(403, "Forbidden - you do not have permission to modify this issue.");
    }
    const updatedIssue = await issue_service_default.UpdateIssueInDB(issueId, req.body);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue
    });
  } catch (error) {
    next(error);
  }
};
var deleteIssue = async (req, res, next) => {
  try {
    const issueId = Number(req.params.id);
    const isDeleted = await issue_service_default.deleteIssueFromDB(issueId);
    if (!isDeleted) {
      throw new AppError(404, "Issue not found or already removed.");
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post(
  "/",
  auth,
  authorizeRoles("contributor", "maintainer"),
  createIssue
);
router2.get("/", getAllIssues);
router2.get("/:id", getSingleIssue);
router2.patch(
  "/:id",
  auth,
  authorizeRoles("maintainer", "contributor"),
  updateIssue
);
router2.delete(
  "/:id",
  auth,
  authorizeRoles("maintainer"),
  deleteIssue
);
var issueRoutes = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Welcome to the DevPulse API!");
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoutes);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  if (process.env.NODE_ENV !== "production") {
    app_default.listen(config_default.port, () => {
      console.log(`Example app listening on port ${config_default.port}`);
    });
  }
};
main();
var server_default = app_default;
export {
  server_default as default
};
//# sourceMappingURL=server.js.map