import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface PlatformSettingsValue {
  minAmount: number;
  maxAmount: number;
  enabledTypes: string[];
  enabledChannels: string[];
}

@Injectable()
export class SettingsService {
  private readonly SETTING_KEY = "platform_settings";
  private readonly DEFAULT_SETTINGS: PlatformSettingsValue = {
    minAmount: 100,
    maxAmount: 100000,
    enabledTypes: ["DIGITAL", "PHYSICAL", "CORPORATE_BULK"],
    enabledChannels: ["EMAIL", "SMS"],
  };

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<PlatformSettingsValue> {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { key: this.SETTING_KEY },
    });
    if (!setting) {
      return this.DEFAULT_SETTINGS;
    }
    const val = setting.value as unknown as PlatformSettingsValue;
    return {
      minAmount: typeof val.minAmount === "number" ? val.minAmount : this.DEFAULT_SETTINGS.minAmount,
      maxAmount: typeof val.maxAmount === "number" ? val.maxAmount : this.DEFAULT_SETTINGS.maxAmount,
      enabledTypes: Array.isArray(val.enabledTypes) ? val.enabledTypes : this.DEFAULT_SETTINGS.enabledTypes,
      enabledChannels: Array.isArray(val.enabledChannels) ? val.enabledChannels : this.DEFAULT_SETTINGS.enabledChannels,
    };
  }

  async updateSettings(data: Partial<PlatformSettingsValue>): Promise<PlatformSettingsValue> {
    const current = await this.getSettings();
    const updated: PlatformSettingsValue = {
      minAmount: typeof data.minAmount === "number" ? data.minAmount : current.minAmount,
      maxAmount: typeof data.maxAmount === "number" ? data.maxAmount : current.maxAmount,
      enabledTypes: Array.isArray(data.enabledTypes) ? data.enabledTypes : current.enabledTypes,
      enabledChannels: Array.isArray(data.enabledChannels) ? data.enabledChannels : current.enabledChannels,
    };

    await this.prisma.platformSetting.upsert({
      where: { key: this.SETTING_KEY },
      update: { value: updated as any },
      create: {
        key: this.SETTING_KEY,
        value: updated as any,
      },
    });

    return updated;
  }
}
