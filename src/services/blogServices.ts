import BlogModel from "../models/blogModels";
import redis from "../config/redis";

class BlogService {
  async getAllBlogs() {
    const cached = await redis.get("blogs");
    if (cached) return JSON.parse(cached);

    const blogs = await BlogModel.findAll();
    await redis.set("blogs", JSON.stringify(blogs), {
      EX: 60 // EX means expire in 60 seconds
    })
    return blogs;
  }

  async getBlogById(id: string) {
    return BlogModel.findById(id);
  }

  async createBlog(title: string, content: string) {
    const newPost = await BlogModel.create({ title, content });
    await redis.del("blogs"); // clear cache
    return newPost;
  }

  async updateBlog(id: string, data: { title?: string; content?: string }) {
    const updated = await BlogModel.update(id, data);
    await redis.del("blogs");
    return updated;
  }

  async deleteBlog(id: string) {
    const deleted = await BlogModel.delete(id);
    await redis.del("blogs");
    return deleted;
  }
}

export default new BlogService();
