import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    // Try to read from cookie first, then from Authorization header
    const token =
      req.cookies?.token
    console.log("Received token:", token);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Attach decoded user info
    req.user = {
      id: decoded.id,
      role: decoded.type||decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



export const permit = (...roles) => {
  const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

  return (req, res, next) => {
    try {
      console.log("User in permit:", req.user);
      console.log("Allowed roles:", allowedRoles);
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient role" });
      }
      next();
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Server error in permit middleware" });
    }
  };

};


export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions?.includes(permission)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};
