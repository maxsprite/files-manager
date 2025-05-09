import cron from "node-cron";

interface ScheduledJob {
  name: string;
  schedule: string;
  handler: () => Promise<unknown>;
  active: boolean;
}

/**
 * Service for managing scheduled tasks.
 * Allows registering, starting, and stopping scheduled tasks.
 */
export class SchedulerService {
  private jobs: ScheduledJob[] = [];
  private tasks: Map<string, cron.ScheduledTask> = new Map<
    string,
    cron.ScheduledTask
  >();

  /**
   * Registers a new task in the scheduler
   */
  registerJob(
    name: string,
    schedule: string,
    handler: () => Promise<unknown>,
    active = true,
  ): void {
    // Check cron expression validity
    if (!cron.validate(schedule)) {
      console.error(`Invalid cron schedule for job ${name}: ${schedule}`);
      return;
    }

    // Check if a task with this name already exists
    const existingJobIndex = this.jobs.findIndex((job) => job.name === name);
    if (existingJobIndex >= 0) {
      // Replace existing task
      this.jobs[existingJobIndex] = {
        name,
        schedule,
        handler,
        active,
      };
      console.log(`Updated existing job: ${name}`);
    } else {
      // Add new task
      this.jobs.push({
        name,
        schedule,
        handler,
        active,
      });
      console.log(`Registered new job: ${name}`);
    }
  }

  /**
   * Starts all registered active tasks
   */
  startAllJobs(): void {
    console.log("Starting scheduler service...");

    for (const job of this.jobs) {
      if (job.active) {
        this.startJob(job);
      }
    }

    console.log(
      `Scheduler service started with ${this.tasks.size} active jobs`,
    );
  }

  /**
   * Starts a specific task
   */
  private startJob(job: ScheduledJob): void {
    try {
      // Stop existing task with the same name if it exists
      if (this.tasks.has(job.name)) {
        this.tasks.get(job.name)?.stop();
        this.tasks.delete(job.name);
      }

      // Create a scheduled task
      const task = cron.schedule(job.schedule, async () => {
        console.log(`Running scheduled job: ${job.name}`);
        try {
          await job.handler();
          console.log(`Job ${job.name} completed successfully`);
        } catch (error) {
          console.error(`Error running job ${job.name}:`, error);
        }
      });

      // Save the task for management
      this.tasks.set(job.name, task);

      console.log(`Job ${job.name} scheduled with cron: ${job.schedule}`);
    } catch (error) {
      console.error(`Failed to schedule job ${job.name}:`, error);
    }
  }

  /**
   * Stops all tasks
   */
  stopAllJobs(): void {
    console.log("Stopping all scheduled jobs...");

    for (const [name, task] of this.tasks.entries()) {
      task.stop();
      console.log(`Job ${name} stopped`);
    }

    this.tasks.clear();
    console.log("All scheduled jobs stopped");
  }

  /**
   * Runs a job manually, outside of schedule
   */
  async runJobManually(name: string): Promise<unknown> {
    const job = this.jobs.find((j) => j.name === name);
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }

    console.log(`Manually running job: ${name}`);
    try {
      const result = await job.handler();
      console.log(`Manual job ${name} completed successfully`);
      return result;
    } catch (error) {
      console.error(`Error manually running job ${name}:`, error);
      throw error;
    }
  }
}
