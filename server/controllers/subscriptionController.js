const { pool } = require("../db/pool");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_KEY);

const subscribe = async (req, res, next) => {
  try {
    const customer = await stripe.customers.create({
      metadata: {
        userId: req.user,
      },
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer: customer.id,
      mode: "payment",
      success_url: `${process.env.CLIENT_BASE_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_BASE_URL}/payment-failed`,
    });

    const found = await pool.query(
      "SELECT id, name, email, profile_picture, roles, favorites FROM users WHERE id = $1",
      [req.user]
    );
    const existing = found.rows[0];

    if (!existing) {
      return res.sendStatus(401);
    }

    const roles = Array.isArray(existing.roles) ? existing.roles : ["BasicUser"];
    const nextRoles = roles.includes("ProUser") ? roles : [...roles, "ProUser"];

    const updated = await pool.query(
      `
        UPDATE users
        SET roles = $2::text[], updated_at = now()
        WHERE id = $1
        RETURNING id, name, email, profile_picture, roles, favorites
      `,
      [req.user, nextRoles]
    );
    const foundUser = updated.rows[0];
    if (!foundUser) {
      return res.sendStatus(401);
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
      { expiresIn: "1d" }
    );

    res.status(200).send({ url: session.url, accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = { subscribe };
