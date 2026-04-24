import { ArenaSession } from "@shared/schema";
import { storage } from "./storage";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export class ArenaService {
  async startChallenge(userId: number, challengeId: string): Promise<ArenaSession> {
    // 1. Create session in DB
    const session = await storage.createArenaSession({
      userId,
      challengeId,
      status: 'starting'
    });

    try {
      // 2. Select Docker image based on challengeId
      // For demo, we use a simple vulnerable app image
      const imageName = "secops/challenge-template:latest";
      
      // 3. Run Docker container
      // Note: In a real production env, you'd use a Docker SDK and proper network isolation
      const port = 30000 + Math.floor(Math.random() * 5000);
      const containerName = `challenge_${session.id}_${userId}`;
      
      // This is a placeholder command - requires Docker on host
      // await execPromise(`docker run -d --name ${containerName} -p ${port}:80 ${imageName}`);
      
      console.log(`Simulating Docker run: ${imageName} on port ${port}`);

      // 4. Update session
      return await storage.updateArenaSession(session.id, {
        status: 'active',
        port: port,
        containerId: containerName,
        flag: `FLAG{${Math.random().toString(36).substring(7).toUpperCase()}}` // Dynamic flag
      });
    } catch (error) {
      console.error("Failed to start Docker container:", error);
      return await storage.updateArenaSession(session.id, {
        status: 'stopped'
      });
    }
  }

  async stopChallenge(sessionId: number): Promise<void> {
    const session = await storage.getArenaSessions(0); // This is mock, we need session by ID
    // In real: const session = await storage.getSessionById(sessionId);
    // if (session?.containerId) {
    //   await execPromise(`docker rm -f ${session.containerId}`);
    // }
    await storage.updateArenaSession(sessionId, { status: 'stopped', endTime: new Date() });
  }

  async submitFlag(userId: number, sessionId: number, submittedFlag: string): Promise<boolean> {
    const sessions = await storage.getArenaSessions(userId);
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session || session.status !== 'active') return false;

    if (session.flag === submittedFlag) {
      await storage.updateArenaSession(sessionId, {
        isSolved: true,
        status: 'completed',
        endTime: new Date()
      });
      return true;
    }
    
    return false;
  }
}

export const arenaService = new ArenaService();
