import { NextFunction, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { IRequestExtended } from '../utils/types';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWKS_URI) {
  throw new Error('The JWKS_URI environment variable is not defined');
}
const client = jwksRsa({
  jwksUri: process.env.JWKS_URI, // Reemplaza YOUR_DOMAIN por tu dominio de Auth0
  cache: true, // Habilita el caché de claves para mejorar el rendimiento
  rateLimit: true, // Limita el número de solicitudes al JWKS endpoint
  jwksRequestsPerMinute: 5, // Número máximo de solicitudes permitidas por minuto
  cacheMaxEntries: 5, // Máximo número de claves que se almacenarán en caché
  cacheMaxAge: 600000, // Tiempo en milisegundos que se almacenará la clave en caché
});

const getKey = (
  header: jwt.JwtHeader,
  callback: jwt.SigningKeyCallback
): void => {
  client.getSigningKey(header.kid!, (err, key) => {
    if (err || !key) {
      return callback(err || new Error('Signing key not found'));
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

export const decodeJwtMiddleware = async (
  req: IRequestExtended | any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error: any = new Error('Token not found');
    error.statusCode = 403;
    return next(error);
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        console.error(err.message);        
        const error: any = new Error('Invalid or expired token');
        error.statusCode = 403;
        return next(error);
      }
      req.auth = decoded as JwtPayload;
      next();
    });
  } catch (error: Error | any) {
    console.error(error.message);
    const err: any = new Error('Invalid token');
    err.statusCode = 403;
    next(err);
  }
};
