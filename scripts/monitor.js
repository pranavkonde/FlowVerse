#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.services = {
      frontend: 'http://localhost:3001',
      backend: 'http://localhost:3002',
      agent: 'http://localhost:3003'
    };
    this.metrics = [];
  }

  async checkServiceHealth(serviceName, url) {
    try {
      const start = Date.now();
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      const responseTime = Date.now() - start;
      
      return {
        service: serviceName,
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        statusCode: response.status
      };
    } catch (error) {
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime: null,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  async checkAllServices() {
    console.log('🔍 Checking service health...');
    
    const checks = Object.entries(this.services).map(([name, url]) => 
      this.checkServiceHealth(name, url)
    );
    
    const results = await Promise.all(checks);
    this.metrics.push(...results);
    
    results.forEach(result => {
      const status = result.status === 'healthy' ? '✅' : '❌';
      const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
      console.log(`${status} ${result.service}: ${result.status} (${time})`);
    });
    
    return results;
  }

  async checkBackendMetrics() {
    try {
      const response = await axios.get(`${this.services.backend}/health`);
      const data = response.data;
      
      console.log('\n📊 Backend Metrics:');
      console.log(`   Rooms: ${data.rooms || 0}`);
      console.log(`   Players: ${data.players || 0}`);
      
      return data;
    } catch (error) {
      console.log('❌ Failed to get backend metrics');
      return null;
    }
  }

  async checkAgentMetrics() {
    try {
      const response = await axios.get(`${this.services.agent}/health`);
      const data = response.data;
      
      console.log('\n🤖 Agent Metrics:');
      console.log(`   Status: ${data.status}`);
      console.log(`   Services: ${JSON.stringify(data.services)}`);
      
      return data;
    } catch (error) {
      console.log('❌ Failed to get agent metrics');
      return null;
    }
  }

  generateReport() {
    const healthyServices = this.metrics.filter(m => m.status === 'healthy').length;
    const totalServices = this.metrics.length;
    const avgResponseTime = this.metrics
      .filter(m => m.responseTime)
      .reduce((sum, m) => sum + m.responseTime, 0) / 
      this.metrics.filter(m => m.responseTime).length || 0;

    console.log('\n📈 Performance Report:');
    console.log(`   Healthy Services: ${healthyServices}/${totalServices}`);
    console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`   Total Checks: ${this.metrics.length}`);
  }

  saveMetrics() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `metrics-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'logs', filename);
    
    // Ensure logs directory exists
    const logsDir = path.dirname(filepath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(this.metrics, null, 2));
    console.log(`\n💾 Metrics saved to: ${filename}`);
  }

  async run() {
    console.log('🚀 Free Flow Performance Monitor');
    console.log('================================\n');
    
    await this.checkAllServices();
    await this.checkBackendMetrics();
    await this.checkAgentMetrics();
    this.generateReport();
    this.saveMetrics();
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.run().catch(console.error);
}

module.exports = PerformanceMonitor;

