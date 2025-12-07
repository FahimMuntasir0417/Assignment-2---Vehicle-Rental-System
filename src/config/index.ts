import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  jwt_Secreat: process.env.JWT_SECRET,
};

export default config;
