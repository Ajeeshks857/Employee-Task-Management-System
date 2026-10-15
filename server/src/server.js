import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import Employee from './models/Employee.js';
import Task from './models/Task.js';
import { seedInitialData } from './seeds/seed.js';
import { slugify } from './utils/slug.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();

    // Auto-seed if database is currently empty
    const count = await Employee.countDocuments();
    if (count === 0) {
      console.log('[Server] Database is empty. Seeding initial assignment data...');
      await seedInitialData();
    } else {
      // Auto-backfill slugs if existing records don't have slugs
      const empsWithoutSlug = await Employee.find({
        $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
      });
      if (empsWithoutSlug.length > 0) {
        console.log(`[Server] Backfilling slugs for ${empsWithoutSlug.length} employees...`);
        for (const emp of empsWithoutSlug) {
          emp.slug = slugify(`${emp.employeeId}-${emp.fullName}`);
          await emp.save();
        }
      }

      const tasksWithoutSlug = await Task.find({
        $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
      });
      if (tasksWithoutSlug.length > 0) {
        console.log(`[Server] Backfilling slugs for ${tasksWithoutSlug.length} tasks...`);
        for (const t of tasksWithoutSlug) {
          const prefix = t.taskId ? t.taskId.toLowerCase() : 'tsk';
          t.slug = slugify(`${prefix}-${t.title.slice(0, 60)}`);
          await t.save();
        }
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] Server is running smoothly on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log('[Server] Gracefully shutting down...');
      server.close();
      await disconnectDB();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[Server] Fatal bootstrap error:', err);
    process.exit(1);
  }
}

bootstrap();
