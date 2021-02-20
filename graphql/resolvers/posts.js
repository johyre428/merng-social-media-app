const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            } catch (error) {
                throw new Error(err);
            }
        },
        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId);
                if (!post) {
                    throw new Error('Post not found');
                }

                return post;
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation: {
        async createPost(_, { body }, context) {
            const { id, username } = checkAuth(context);
            const newPost = new Post({
                body,
                user: id,
                username,
                createdAt: new Date().toISOString()
            })

            return await newPost.save();
        },
        async deletePost(parent, { postId }, context) {
            const { username } = checkAuth(context);

            try {
                const post = await Post.findById(postId);
                const postNotMine = username !== post.username;

                if (postNotMine) {
                    throw new AuthenticationError("Action not allowed");
                }

                await post.delete();
                return "Post deleted successfully";
            } catch (error) {
                throw new Error(error)
            }
        },
        async likePost(parent, { postId }, context) {
            const { username } = checkAuth(context);

            try {
                const post = await Post.findById(postId);
                if (!post) {
                    throw new UserInputError("Post not found");
                }

                const isAlreadyLiked = post.likes.find((like) => like.username === username);
                if (isAlreadyLiked) {
                    const removeLike = function removeLike(like) {
                        return like.username !== username
                    }

                    post.likes = post.likes.filter(removeLike);
                } else {
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }

                await post.save();

                return post;
            } catch (error) {
                throw new Error(error)
            }
        }
    }
}