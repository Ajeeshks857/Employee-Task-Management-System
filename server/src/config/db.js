import mongoose from 'mongoose';
import fs from 'fs';
import os from 'os';
import path from 'path';

class DatabaseConnection {
  static instance = null;

  constructor() {
    this.memoryServer = null;
    this.tempDbPath = null;
  }

  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect() {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_task_management';

    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[Database] Connected successfully to MongoDB at ${mongoose.connection.host}`);
    } catch (err) {
      console.warn(`[Database] Failed to connect to ${mongoUri}: ${err.message}`);

      // Auto fallback to MongoMemoryServer for zero-friction local development
      try {
        console.log('[Database] Starting in-memory MongoDB server as fallback...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');

        this.memoryServer = await MongoMemoryServer.create();

        const memUri = this.memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[Database] Connected to In-Memory MongoDB at ${memUri}`);
      } catch (fallbackErr) {
        console.error('[Database] In-memory database startup failed:', fallbackErr.message);
        throw fallbackErr;
      }
    }

    mongoose.connection.on('error', (err) => {
      console.error('[Database] Connection runtime error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] Disconnected from MongoDB');
    });
  }

  async disconnect() {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      if (this.memoryServer) {
        await this.memoryServer.stop({ doCleanup: true });
        this.memoryServer = null;
      }
      if (this.tempDbPath && fs.existsSync(this.tempDbPath)) {
        try {
          fs.rmSync(this.tempDbPath, { recursive: true, force: true });
        } catch (_) {}
      }
      console.log('[Database] Disconnected cleanly');
    } catch (e) {
      console.warn('[Database] Error during disconnect:', e.message);
    }
  }
}

export const connectDB = () => DatabaseConnection.getInstance().connect();
export const disconnectDB = () => DatabaseConnection.getInstance().disconnect();
export default DatabaseConnection;
