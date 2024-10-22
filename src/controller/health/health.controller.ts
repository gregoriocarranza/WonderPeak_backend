import { NextFunction, Request, Response } from 'express';
import * as pjson from '../../../package.json';
import { IHealthController } from './health.controller.interface';
import { getServiceEnvironment } from '../../utils/environment.resolver';
import { formatUptime } from '../../utils/UpTime.resolver';

export class HealthController implements IHealthController {
  constructor() {}

  public getHealth(_req: Request, res: Response, next: NextFunction): void {
    try {
      const healthStatus = {
        success: true,
        health: 'Up!',
        environment: getServiceEnvironment(),
        version: pjson.version as string,
        timestamp: new Date().toISOString(),
        uptime: formatUptime(process.uptime()),
      };

      res.status(200).json(healthStatus);
    } catch (err) {
      next(err);
    }
  }
}
