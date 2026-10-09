//const postStore = require('../data/postStore');
const postRepository = require('../repositories/postRepository');
function listPosts() {
  return postStore.posts;
}
function getPost(id) {
  return postRepository.findById(id);
}

function createPost(fields) {
  if (!fields || !fields.title) {
    const error = new Error('Title is required');
    error.statusCode = 422;
    throw error;
  }

  const post = {
    id: postStore.nextId(),
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  };
  postStore.posts.push(post);
  return post;
}

function updatePost(id, patch) {
  const post = getPost(id);
  if (!post) return null;
  if (patch.title !== undefined) post.title = patch.title;
  if (patch.body !== undefined) post.body = patch.body;
  return post;
}

function removePost(id) {
  const index = postStore.posts.findIndex((post) => post.id === Number(id));
  if (index === -1) return false;
  postStore.posts.splice(index, 1);
  return true;
}

module.exports = { listPosts, getPost, createPost, updatePost, removePost };
