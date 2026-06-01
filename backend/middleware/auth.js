const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null;
  if (!token) return res.status(401).json({ success:false, error:"Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user || !req.user.isActive)
      return res.status(401).json({ success:false, error:"User not found or disabled" });
    next();
  } catch(e) { res.status(401).json({ success:false, error:"Token invalid or expired" }); }
};
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success:false, error:`Role not authorized` });
  next();
};
const faceEnrollAuth = (req, res, next) => {
  const ok = req.user.role==="admin" || (req.user.role==="hod" && req.user.department==="Computer Science");
  if (!ok) return res.status(403).json({ success:false, error:"Only Admin and HoD (CS) can enroll faces" });
  next();
};
module.exports = { protect, authorize, faceEnrollAuth };