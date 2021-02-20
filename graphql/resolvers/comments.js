const { UserInputError, AuthenticationError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../utils/check-auth");

module.exports = {
    Mutation: {
        async createComment(parent, { postId, body }, context) {
            const { username } = checkAuth(context);

            if (body.trim() === "") {
                throw new UserInputError("Empty comment", {
                    errors: {
                        body: "Comment body must not be empty"
                    }
                })
            }

            try {
                const post = await Post.findById(postId);
                if (!post) {
                    throw new UserInputError("Post not found");
                }

                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                });

                await post.save();

                return post;
            } catch (error) {
                throw new Error(error);
            }
        },
        async deleteComment(parent, { postId, commentId }, context) {
            const { username } = checkAuth(context);

            try {
                const post = await Post.findById(postId);

                if (!post) {
                    throw new UserInputError("Post not found");
                }

                const comment = post.comments.find(comment => comment.id === commentId);
                const commentNotMine = username !== comment.username;

                if (commentNotMine) {
                    throw new AuthenticationError("Action not allowed");
                }

                const removeComment = function removeComment(comment) {
                    return comment.id !== commentId;
                }

                post.comments = post.comments.filter(removeComment);

                await post.save();

                return post;
            } catch (error) {
                throw new Error(error);
            }
        }
    }
}