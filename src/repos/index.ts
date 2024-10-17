import { PrismaClient } from "@prisma/client";
import Vendor from "./Vendor";

const prisma: PrismaClient = new PrismaClient();

export default prisma;
export {Vendor};
