import { ACHIEVEMENTS, AchievementId } from '@/constants/achievements';

const STORAGE_KEY = 'game_achievements';

// 默认解锁的成就
const DEFAULT_UNLOCKED_ACHIEVEMENTS = ['OFFER_CLAIMER'];

export class AchievementManager {
  private static instance: AchievementManager;
  private achievements: Set<string>;

  private constructor() {
    const savedAchievements = this.loadAchievements();
    this.achievements = new Set([
      ...savedAchievements,
      ...DEFAULT_UNLOCKED_ACHIEVEMENTS
    ]);
    // 确保默认成就被保存
    this.saveAchievements();
  }

  public static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  private loadAchievements(): string[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  private saveAchievements(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.achievements)));
  }

  public unlockAchievement(achievementId: AchievementId): boolean {
    if (this.achievements.has(achievementId)) {
      return false;
    }
    this.achievements.add(achievementId);
    this.saveAchievements();
    return true;
  }

  public hasAchievement(achievementId: AchievementId): boolean {
    return this.achievements.has(achievementId);
  }

  public getUnlockedAchievements() {
    return Array.from(this.achievements).map(id => ACHIEVEMENTS[id as AchievementId]);
  }
} 