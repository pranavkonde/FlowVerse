import { Request, Response } from 'express';
import { WeatherService } from '../services/WeatherService';

export class WeatherController {
  private weatherService: WeatherService;

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

  public async getCurrentWeather(req: Request, res: Response): Promise<void> {
    try {
      const weather = this.weatherService.getCurrentWeather();
      res.json(weather);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch current weather' });
    }
  }

  public async getZoneWeather(req: Request, res: Response): Promise<void> {
    try {
      const { zoneId } = req.params;
      const weather = this.weatherService.getZoneWeather(zoneId);
      
      if (!weather) {
        res.status(404).json({ error: 'Zone not found' });
        return;
      }

      res.json(weather);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch zone weather' });
    }
  }

  public async getWeatherForecast(req: Request, res: Response): Promise<void> {
    try {
      const forecast = this.weatherService.getWeatherForecast();
      res.json(forecast);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch weather forecast' });
    }
  }

  public async getWeatherStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = this.weatherService.getWeatherStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch weather stats' });
    }
  }

  public async getZones(req: Request, res: Response): Promise<void> {
    try {
      const zones = this.weatherService.getZones();
      res.json(zones);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch weather zones' });
    }
  }
}

