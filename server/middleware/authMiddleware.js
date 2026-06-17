const { verifyToken } = require("../config/jwt");

module.exports = (req, res, next) => {
  console.log("AUTH HEADER:", req.headers.authorization);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    console.log("DECODED TOKEN:", decoded);

    req.user = decoded;

    next();
  } catch (err) {
    console.log("TOKEN ERROR:", err.message);

    return res.status(401).json({
      error: "Invalid token",
      message: err.message
    });
  }
};
