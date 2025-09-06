import express from "express";
import { auth } from "./middlewares/auth";

const app = express();

app.use(express.json());
app.use(auth);

const PORT = process.env.PORT || 3000;

app.use("/api/v1", userRoutes);

app.use("/api/v1", auth, productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});