const { randomUUID } = require("crypto");
const { pool } = require("../db/pool");
const jwt = require("jsonwebtoken");

function mapRecipeRow(row) {
  return {
    _id: row.id,
    title: row.title,
    author: row.author_id
      ? { _id: row.author_id, name: row.author_name || null }
      : null,
    description: row.description,
    image: row.image,
    cookingTime: row.cooking_time,
    calories: row.calories,
    ingredients: row.ingredients || [],
    instructions: row.instructions || [],
    ratings: row.ratings || [],
    comments: row.comments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const getAllRecipes = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name AS author_name
      FROM recipes r
      LEFT JOIN users u ON u.id = r.author_id
      ORDER BY r.created_at DESC
    `);
    res.status(200).send(result.rows.map(mapRecipeRow));
  } catch (error) {
    next(error);
  }
};

const getRecipe = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT r.*, u.name AS author_name
        FROM recipes r
        LEFT JOIN users u ON u.id = r.author_id
        WHERE r.id = $1
      `,
      [req.params.id]
    );

    const recipe = result.rows[0];
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    res.status(200).send(mapRecipeRow(recipe));
  } catch (error) {
    next(error);
  }
};

const addRecipe = async (req, res, next) => {
  try {
    const {
      title,
      image,
      description,
      calories,
      cookingTime,
      ingredients,
      instructions,
    } = req.body;
    if (
      !title ||
      !image ||
      !description ||
      !calories ||
      !cookingTime ||
      !ingredients.length ||
      !instructions.length
    ) {
      return res.status(422).json({ message: "Insufficient data" });
    }

    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO recipes
          (id, title, author_id, description, image, cooking_time, calories, ingredients, instructions, ratings, comments)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, '[]'::jsonb, '[]'::jsonb)
      `,
      [
        id,
        title,
        req.user,
        description,
        image,
        cookingTime,
        calories,
        ingredients,
        instructions,
      ]
    );
    res.status(201).json({ success: "Recipe added successfully" });
  } catch (error) {
    next(error);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const {
      title,
      image,
      description,
      calories,
      cookingTime,
      ingredients,
      instructions,
    } = req.body;
    if (
      !title ||
      !image ||
      !description ||
      !calories ||
      !cookingTime ||
      !ingredients.length ||
      !instructions.length
    ) {
      return res.status(422).json({ message: "Insufficient data" });
    }

    const found = await pool.query("SELECT id, author_id FROM recipes WHERE id = $1", [
      req.params.id,
    ]);
    const foundRecipe = found.rows[0];
    if (!foundRecipe) return res.status(404).json({ message: "Recipe not found" });

    if (foundRecipe.author_id !== req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const updated = await pool.query(
      `
        UPDATE recipes
        SET
          title = $2,
          description = $3,
          image = $4,
          calories = $5,
          ingredients = $6,
          cooking_time = $7,
          instructions = $8,
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [
        req.params.id,
        title,
        description,
        image,
        calories,
        ingredients,
        cookingTime,
        instructions,
      ]
    );
    res.status(201).json(mapRecipeRow(updated.rows[0]));
  } catch (error) {
    next(error);
  }
};

const rateRecipe = async (req, res, next) => {
  try {
    const { rating } = req.body;

    const result = await pool.query("SELECT id, ratings FROM recipes WHERE id = $1", [
      req.params.id,
    ]);
    const recipe = result.rows[0];
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    // Check if the user has already rated this recipe
    const ratings = Array.isArray(recipe.ratings) ? recipe.ratings : [];
    const existingRating = ratings.find((rate) => rate?.userId === req.user);
    if (existingRating) {
      return res
        .status(400)
        .json({ message: "User has already rated this recipe" });
    }

    // Add the new rating
    ratings.push({ userId: req.user, rating: rating });
    await pool.query("UPDATE recipes SET ratings = $2::jsonb, updated_at = now() WHERE id = $1", [
      req.params.id,
      JSON.stringify(ratings),
    ]);

    res.status(201).json({ message: "Rating added successfully." });
  } catch (error) {
    next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const found = await pool.query("SELECT id, author_id FROM recipes WHERE id = $1", [
      req.params.id,
    ]);
    const foundRecipe = found.rows[0];
    if (!foundRecipe) return res.status(404).json({ message: "Recipe not found" });

    if (foundRecipe.author_id !== req.user)
      return res.status(401).json({ message: "Unauthorized" });

    await pool.query("DELETE FROM recipes WHERE id = $1", [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;

    // Validate userId and commentText
    if (!comment) {
      return res.status(400).json({ message: "Comment is required." });
    }

    const recipeRes = await pool.query("SELECT id, comments FROM recipes WHERE id = $1", [
      req.params.id,
    ]);
    const recipe = recipeRes.rows[0];
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    // Add the new comment
    const userRes = await pool.query(
      `SELECT id, name, profile_picture FROM users WHERE id = $1`,
      [req.user]
    );
    const user = userRes.rows[0];
    const comments = Array.isArray(recipe.comments) ? recipe.comments : [];
    const commentId = randomUUID();
    comments.push({
      _id: commentId,
      user: user
        ? { _id: user.id, name: user.name, profilePicture: user.profile_picture }
        : { _id: req.user, name: null, profilePicture: "" },
      comment,
      date: new Date().toISOString(),
    });

    await pool.query("UPDATE recipes SET comments = $2::jsonb, updated_at = now() WHERE id = $1", [
      req.params.id,
      JSON.stringify(comments),
    ]);

    res.status(201).json({ message: "Comment added successfully." });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { recipeId, commentId } = req.params;

    const recipeRes = await pool.query("SELECT id, comments FROM recipes WHERE id = $1", [
      recipeId,
    ]);
    const recipe = recipeRes.rows[0];
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    const comments = Array.isArray(recipe.comments) ? recipe.comments : [];
    const commentIndex = comments.findIndex((c) => c?._id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found." });
    }

    comments.splice(commentIndex, 1);
    await pool.query("UPDATE recipes SET comments = $2::jsonb, updated_at = now() WHERE id = $1", [
      recipeId,
      JSON.stringify(comments),
    ]);

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const toggleFavoriteRecipe = async (req, res, next) => {
  try {
    const userRes = await pool.query(
      "SELECT id, name, email, profile_picture, roles, favorites FROM users WHERE id = $1",
      [req.user]
    );
    const user = userRes.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favorites = Array.isArray(user.favorites) ? user.favorites : [];
    const recipeIndex = favorites.indexOf(req.params.id);
    if (recipeIndex === -1) {
      // Recipe not present, add it to favorites
      favorites.push(req.params.id);
    } else {
      // Recipe already present, remove it from favorites
      favorites.splice(recipeIndex, 1);
    }

    await pool.query("UPDATE users SET favorites = $2::uuid[], updated_at = now() WHERE id = $1", [
      req.user,
      favorites,
    ]);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          userId: user.id,
          name: user.name,
          email: user.email,
          profilePicture: user.profile_picture,
          roles: user.roles || ["BasicUser"],
          favorites: favorites,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    return res.status(201).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRecipes,
  getRecipe,
  addRecipe,
  updateRecipe,
  rateRecipe,
  deleteRecipe,
  addComment,
  deleteComment,
  toggleFavoriteRecipe,
};
