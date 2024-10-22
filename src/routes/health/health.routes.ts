import { Router } from 'express';
import { IHealthController } from '../../controller/health/health.controller.interface';
import { HealthController } from '../../controller/health/health.controller';

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
