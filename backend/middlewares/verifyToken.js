const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromCookie = req.cookies.token;

  const token = authHeader || tokenFromCookie;
  if (!token) return res.status(401).json({ msg: "No token found" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user to the request for future use
    next();
  } catch (error) {
    return res.status(403).json({ msg: "Invalid token" });
  }
};

// if (authHeader && authHeader.startsWith("Bearer ")) {
//   const token = authHeader.split(" ")[1];
//   // console.log("Token:", token);
//   jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
//     if (err) {
//       console.error("Error verifying token:", err);
//       return res.status(403).json({ msg: "Wrong or expired token" });
//     } else {
//       req.user = data;
//       next();
//     }
//   });
// } else {
//   return res
//     .status(403)
//     .json({ msg: "Not authorized. You are not logged in" });
// }

module.exports = verifyToken;
