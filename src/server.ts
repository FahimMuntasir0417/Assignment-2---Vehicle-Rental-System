import config from "./config/index";
import app from "./app";

const port = config.port;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
