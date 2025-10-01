import { Request, Response } from 'express';
import { StatisticsService } from '../services/StatisticsService';

export class StatisticsController {
  private statisticsService: StatisticsService;

  constructor() {
    this.statisticsService = new StatisticsService();
  }

  /**
   * Get player statistics dashboard data
   */
  async getPlayerStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { timeframe = 'all' } = req.query;

      const statistics = await this.statisticsService.getPlayerStatistics(
        playerId,
        timeframe as string
      );

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting player statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get player statistics'
      });
    }
  }

  /**
   * Get player activity summary
   */
  async getActivitySummary(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { days = 30 } = req.query;

      const activitySummary = await this.statisticsService.getActivitySummary(
        playerId,
        parseInt(days as string)
      );

      res.json({
        success: true,
        data: activitySummary
      });
    } catch (error) {
      console.error('Error getting activity summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get activity summary'
      });
    }
  }

  /**
   * Get player performance metrics
   */
  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { category } = req.query;

      const metrics = await this.statisticsService.getPerformanceMetrics(
        playerId,
        category as string
      );

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get performance metrics'
      });
    }
  }

  /**
   * Get player comparison data
   */
  async getPlayerComparison(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { compareWith } = req.query;

      const comparison = await this.statisticsService.getPlayerComparison(
        playerId,
        compareWith as string
      );

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      console.error('Error getting player comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get player comparison'
      });
    }
  }

  /**
   * Get achievement progress
   */
  async getAchievementProgress(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;

      const progress = await this.statisticsService.getAchievementProgress(playerId);

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get achievement progress'
      });
    }
  }

  /**
   * Update player statistics
   */
  async updateStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { category, value, metadata } = req.body;

      await this.statisticsService.updateStatistics(playerId, {
        category,
        value,
        metadata,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Statistics updated successfully'
      });
    } catch (error) {
      console.error('Error updating statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update statistics'
      });
    }
  }
}
