import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './Middlewares/error.middleware';
import morgan from 'morgan';
import path from 'path';
import { HealthRouter } from './Routes/health/health.routes';

import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import { AuthRouter } from './Routes/Auth.routes';
import { UserRouter } from './Routes/User.routes';
import { PostRouter } from './Routes/Post.routes';
import { CommentRouter } from './Routes/Comment.routes';

dotenv.config();

const app: Application = express();

const swaggerDocument = yaml.load(
  fs.readFileSync('./docs/api-documentation.yaml', 'utf8')
) as object;

app.use(
  cors({
    // origin: getAllowedOrigins(),
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

if (process.env.ENVIRONMENT != 'production') {
  app.use(morgan('tiny'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/health', new HealthRouter().router);
app.use('/api/auth', new AuthRouter().router);
app.use('/api/users', new UserRouter().router);
app.use('/api/posts', new PostRouter().router);
app.use('/api/comments', new CommentRouter().router);

app.use(errorMiddleware);

export default app;
