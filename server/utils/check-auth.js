const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");

module.exports = (context) => {
    const authHeader = context.req.headers.authorization;
    if (!authHeader) {
        throw new Error('Authorization header must be provided');
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
        throw new Error("Authentication token must be 'Bearer [token]'");
    }

    try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
    } catch (error) {
        throw new AuthenticationError('Invalid/Expired token');
    }
}
