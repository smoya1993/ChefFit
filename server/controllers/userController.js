const { pool } = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id AS "_id",
          name,
          email,
          profile_picture AS "profilePicture",
          roles,
          is_disabled AS "isDisabled",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        WHERE id <> $1
      `,
      [req.user]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, image } = req.body;

    // Prevent using an email that belongs to another user
    const emailOwner = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (emailOwner.rowCount && emailOwner.rows[0].id !== req.user) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updated = await pool.query(
      `
        UPDATE users
        SET
          name = $2,
          email = $3,
          password = $4,
          profile_picture = COALESCE($5, profile_picture),
          updated_at = now()
        WHERE id = $1
        RETURNING id, name, email, profile_picture, roles, favorites
      `,
      [req.user, name, email, hashedPassword, image || null]
    );

    const foundUser = updated.rows[0];
    if (!foundUser) return res.sendStatus(404);

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
    return res.status(201).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const disableUser = async (req, res, next) => {
  try {
    await pool.query("UPDATE users SET is_disabled = true, updated_at = now() WHERE id = $1", [
      req.params.id,
    ]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUser, disableUser };
