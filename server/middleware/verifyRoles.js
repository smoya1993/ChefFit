const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.roles) {
      return res.status(401).json({
        message: "Unauthorized",
        reason: "Missing roles in token",
        allowedRoles,
      });
    }

    const result = req.roles.some((role) => allowedRoles.includes(role));

    if (!result) {
      return res.status(403).json({
        message: "Forbidden",
        allowedRoles,
        userRoles: req.roles,
      });
    }
    next();
  };
};

module.exports = verifyRoles;
