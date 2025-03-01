import "dotenv/config";
import app from "./index.js";
import { testConnection } from "./db/database.js";
import "./models/index.js";

const PORT = process.env.PORT || 8000;

testConnection();

app.listen(PORT, () => {
	console.log(`Server is listening at port ${PORT}`);
});
