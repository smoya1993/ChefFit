const { randomUUID } = require("crypto");
const { pool } = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All inputs are required" });
  }

  const duplicate = await pool.query("SELECT 1 FROM users WHERE email = $1", [
    email,
  ]);
  if (duplicate.rowCount) return res.sendStatus(409);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    await pool.query(
      `
        INSERT INTO users (id, name, email, password, profile_picture, favorites, roles, is_disabled, refresh_token)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        userId,
        name,
        email,
        hashedPassword,
        req.body.profilePicture || "",
        [],
        ["BasicUser"],
        false,
        "",
      ]
    );
    res.status(201).json({ success: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const found = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const foundUser = found.rows[0];
    if (!foundUser) {
      if (process.env.DEBUG_AUTH === "1") {
        console.log("[AUTH][login] user not found", { email });
        return res.status(401).json({ message: "Unauthorized", reason: "user_not_found" });
      }
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (foundUser.is_disabled) {
      return res.status(403).json({ message: "Account terminated" });
    }

    const storedHash =
      typeof foundUser.password === "string" ? foundUser.password : String(foundUser.password ?? "");
    const match = await bcrypt.compare(password, storedHash);
    if (!match) {
      if (process.env.DEBUG_AUTH === "1") {
        console.log("[AUTH][login] bad password", {
          email,
          hashPrefix: storedHash.slice(0, 4),
          hashLen: storedHash.length,
        });
        return res.status(401).json({ message: "Unauthorized", reason: "bad_password" });
      }
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          userId: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          profilePicture: foundUser.profile_picture,
          roles: foundUser.roles || ["BasicUser"],
          favorites: foundUser.favorites || [],
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: foundUser.id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "2d" }
    );

    await pool.query("UPDATE users SET refresh_token = $1, updated_at = now() WHERE id = $2", [
      refreshToken,
      foundUser.id,
    ]);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  const found = await pool.query("SELECT * FROM users WHERE refresh_token = $1", [
    refreshToken,
  ]);
  const foundUser = found.rows[0];
  if (!foundUser) {
    return res.status(403).json({ message: "Forbidden" });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err || foundUser.id !== decoded.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            userId: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            profilePicture: foundUser.profile_picture,
            roles: foundUser.roles || ["BasicUser"],
            favorites: foundUser.favorites || [],
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );
      res.json({ accessToken });
    }
  );
};

const logout = async (req, res) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const found = await pool.query("SELECT id FROM users WHERE refresh_token = $1", [
    refreshToken,
  ]);
  const foundUser = found.rows[0];

  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  await pool.query("UPDATE users SET refresh_token = '', updated_at = now() WHERE id = $1", [
    foundUser.id,
  ]);

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

module.exports = { register, login, refreshToken, logout };
