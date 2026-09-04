import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import routes from "./routes/index.js"

const app = express();
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve(currentDirectory, "../uploads")));
app.use (routes);


const port = Number(process.env.PORT || 3333);
app.listen(port, ()=> {
    console.log(`servidor rodando na porta ${port}`)
});

