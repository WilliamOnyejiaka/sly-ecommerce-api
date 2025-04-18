import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class BlogModel {
  async create(data: { title: string; content: string; userId: string}) {
    return prisma.blog.create({ data });
  }

  async findAll() {
    return prisma.blog.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    return prisma.blog.findUnique({ where: { id } });
  }

  async update(id: string, data: { title?: string; content?: string }) {
    return prisma.blog.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.blog.delete({ where: { id } });
  }
}

export default new BlogModel();
