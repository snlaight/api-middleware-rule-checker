import bodyParser from 'body-parser';

export default function (app) {
  app.set('port', process.env.PORT || 3000);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
}

