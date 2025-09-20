const { expect } = require('chai');
const axios = require('axios');

describe('Free Flow Integration Tests', function () {
  const FRONTEND_URL = 'http://localhost:3001';
  const BACKEND_URL = 'http://localhost:3002';
  const AGENT_URL = 'http://localhost:3003';

  describe('Backend API', function () {
    it('should return health status', async function () {
      const response = await axios.get(`${BACKEND_URL}/health`);
      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('healthy');
    });

    it('should return room list', async function () {
      const response = await axios.get(`${BACKEND_URL}/rooms`);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('rooms');
      expect(Array.isArray(response.data.rooms)).to.be.true;
    });
  });

  describe('Agent API', function () {
    it('should return health status', async function () {
      const response = await axios.get(`${AGENT_URL}/health`);
      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('healthy');
    });

    it('should process voice command', async function () {
      const response = await axios.post(`${AGENT_URL}/api/voice-command`, {
        command: 'price of FLOW',
        userId: 'test-user'
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success');
    });

    it('should get token price', async function () {
      const response = await axios.get(`${AGENT_URL}/api/price/0x7e60df042a9c0868`);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success');
    });
  });

  describe('Frontend', function () {
    it('should load main page', async function () {
      const response = await axios.get(FRONTEND_URL);
      expect(response.status).to.equal(200);
      expect(response.data).to.include('Free Flow');
    });
  });

  describe('Socket.io Connection', function () {
    it('should connect to backend', function (done) {
      const io = require('socket.io-client');
      const socket = io(BACKEND_URL);
      
      socket.on('connect', () => {
        expect(socket.connected).to.be.true;
        socket.disconnect();
        done();
      });
      
      socket.on('connect_error', (error) => {
        done(error);
      });
    });
  });
});
