import express from "express";
import { port } from "config";
import { logger, expressLogger, expressErrorLogger } from "./logger";
import middlewareExpress from "./middleware/express";
import routes from "./routes";

const app = express();

app.use(expressLogger);
middlewareExpress(app);
routes(app);
app.use(expressErrorLogger);

app.use((error, request, response, next) => {
  const statusCode = error.statusCode || 500;
  let message = error instanceof Error ? error.message : error;
  if (statusCode >= 500) {
    message = "Internal server error.";
  }
  if (typeof message === "string") {
    message = {
      message,
    };
  }

  response.status(statusCode).json(message);
});

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  logger.info(
    `Express server listening on port ${port} in ${app.get("env")} mode`
  );
});

module.exports = app;
