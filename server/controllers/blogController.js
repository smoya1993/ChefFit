const { randomUUID } = require("crypto");
const { pool } = require("../db/pool");

function mapBlogRow(row) {
  return {
    _id: row.id,
    title: row.title,
    author: row.author_id
      ? { _id: row.author_id, name: row.author_name || null }
      : null,
    description: row.description,
    image: row.image,
    ratings: row.ratings || [],
    comments: row.comments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const getAllBlogs = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT b.*, u.name AS author_name
      FROM blogs b
      LEFT JOIN users u ON u.id = b.author_id
      ORDER BY b.created_at DESC
    `);
    res.status(200).json(result.rows.map(mapBlogRow));
  } catch (error) {
    next(error);
  }
};

const getBlog = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT b.*, u.name AS author_name
        FROM blogs b
        LEFT JOIN users u ON u.id = b.author_id
        WHERE b.id = $1
      `,
      [req.params.id]
    );

    const blog = result.rows[0];
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.status(200).json(mapBlogRow(blog));
  } catch (error) {
    next(error);
  }
};

const addBlog = async (req, res, next) => {
  try {
    const { title, image, description } = req.body;
    if (!title || !image || !description) {
      return res.status(422).json({ message: "Insufficient data" });
    }

    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO blogs (id, title, author_id, description, image, ratings, comments)
        VALUES ($1, $2, $3, $4, $5, '[]'::jsonb, '[]'::jsonb)
      `,
      [id, title, req.user, description, image]
    );
    return res.status(201).json({ success: "Blog added successfully" });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const { title, image, description } = req.body;
    if (!title || !image || !description) {
      return res.status(422).json({ message: "Insufficient data" });
    }

    const found = await pool.query("SELECT id, author_id FROM blogs WHERE id = $1", [
      req.params.id,
    ]);
    const foundBlog = found.rows[0];
    if (!foundBlog) return res.status(404).json({ message: "Blog not found" });

    if (foundBlog.author_id !== req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updated = await pool.query(
      `
        UPDATE blogs
        SET title = $2, image = $3, description = $4, updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [req.params.id, title, image, description]
    );
    return res.status(201).json(mapBlogRow(updated.rows[0]));
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const found = await pool.query("SELECT id, author_id FROM blogs WHERE id = $1", [
      req.params.id,
    ]);
    const foundBlog = found.rows[0];

    if (!foundBlog) return res.status(404).json({ message: "Blog not found" });

    if (foundBlog.author_id !== req.user)
      return res.status(401).json({ message: "Unauthorized" });

    await pool.query("DELETE FROM blogs WHERE id = $1", [req.params.id]);

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

    const blogRes = await pool.query("SELECT id, comments FROM blogs WHERE id = $1", [
      req.params.id,
    ]);
    const blog = blogRes.rows[0];
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    // Add the new comment
    const userRes = await pool.query(
      `SELECT id, name, profile_picture FROM users WHERE id = $1`,
      [req.user]
    );
    const user = userRes.rows[0];
    const comments = Array.isArray(blog.comments) ? blog.comments : [];
    const commentId = randomUUID();
    comments.push({
      _id: commentId,
      user: user
        ? { _id: user.id, name: user.name, profilePicture: user.profile_picture }
        : { _id: req.user, name: null, profilePicture: "" },
      comment,
      date: new Date().toISOString(),
    });

    await pool.query("UPDATE blogs SET comments = $2::jsonb, updated_at = now() WHERE id = $1", [
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
    const { blogId, commentId } = req.params;

    const blogRes = await pool.query("SELECT id, comments FROM blogs WHERE id = $1", [
      blogId,
    ]);
    const blog = blogRes.rows[0];
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const comments = Array.isArray(blog.comments) ? blog.comments : [];
    const commentIndex = comments.findIndex((c) => c?._id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found." });
    }

    comments.splice(commentIndex, 1);
    await pool.query("UPDATE blogs SET comments = $2::jsonb, updated_at = now() WHERE id = $1", [
      blogId,
      JSON.stringify(comments),
    ]);

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBlogs,
  getBlog,
  addBlog,
  updateBlog,
  deleteBlog,
  addComment,
  deleteComment,
};
