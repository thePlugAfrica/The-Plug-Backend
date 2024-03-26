import jwt from "jsonwebtoken";
import { errorResMsg } from "../utils/lib/response.js";
// import logger from "../utils/log/logger";


export const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) return errorResMsg(res, 401, "Authentication failed");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) return errorResMsg(res, 401, "Authentication failed");
    req.user = decoded;
    next();
  } catch (error) {
    return errorResMsg(res, 401, "Authentication failed: 🔒🔒🔒🔒🔒");
  }
};

export const createJwtToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '2day',
  });
  return token;
};

export const verifyJwtToken = (token, next) => {
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return userId;
  } catch (err) {
    next(err);
  }
};

export const passwordJwtToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });
  return token;
};
