import { checkAgainstRules } from "./middleware/request-middleware";
import accountRouter from "./middleware";

export default function (app) {
  // routes
  app.use("/api/account", checkAgainstRules, accountRouter);

  // 404 sinkhole
  app.route("/*").all((req, res) => {
    res.sendStatus(404);
  });
}
