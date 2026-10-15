import DashboardService from './dashboard.service.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

class DashboardController {
  getDashboardData = asyncHandler(async (req, res) => {
    const data = await DashboardService.getDashboardMetrics();
    res.status(200).json({
      success: true,
      data,
    });
  });
}

export default new DashboardController();
