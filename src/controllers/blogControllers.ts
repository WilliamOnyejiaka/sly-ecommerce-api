import { Request, Response } from "express";
import BlogService from "../services/blogServices";

class BlogController {
  async getAll(req: Request, res: Response) {
    const blogs = await BlogService.getAllBlogs();
    res.json(blogs);
  }

  async getOne(req: Request, res: Response) {
    const blog = await BlogService.getBlogById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });
    res.json(blog);
  }

  async create(req: Request, res: Response) {
    const { title, content } = req.body;
    const blog = await BlogService.createBlog(title, content);
    res.status(201).json(blog);
  }

  async update(req: Request, res: Response) {
    const blog = await BlogService.updateBlog(req.params.id, req.body);
    res.json(blog);
  }

  async delete(req: Request, res: Response) {
    await BlogService.deleteBlog(req.params.id);
    res.status(204).send();
  }
}

export default new BlogController();
