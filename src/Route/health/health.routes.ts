import { Router } from 'express';
import { IHealthController } from '../../Controller/health/health.controller.interface';
import { HealthController } from '../../Controller/health/health.controller';

export class HealthRouter {
  public router: Router = Router();
  private _healthController: IHealthController = new HealthController();

  constructor() {
    this.initRoutes();
  }
  private initRoutes(): void {
    this.router.get('/', this._healthController.getHealth);
  }
}
