// src/utils/templateRegistry.ts
// 模板注册中心

import { classicTemplate } from './templates/classicTemplate';
import { modernTemplate } from './templates/modernTemplate';
import { professionalTemplate } from './templates/professionalTemplate';
import { minimalistTemplate } from './templates/minimalistTemplate';
import { creativeTemplate } from './templates/creativeTemplate';

export interface ResumeJson {
  name?: string;
  phone?: string;
  email?: string;
  skills?: string[];
  work_experiences?: Array<{
    company: string;
    title: string;
    start_date: string;
    end_date: string;
    responsibilities?: string[];
  }>;
  education?: {
    school: string;
    degree: string;
    major?: string;
    start_date: string;
    end_date: string;
  };
  photo_base64?: string;
}

export interface TemplateOptions {
  includePhoto?: boolean;
}

export interface ResumeTemplate {
  key: string;
  name: string;
  hasPhoto: boolean;
  render(data: ResumeJson, options?: TemplateOptions): string;
}

class TemplateRegistry {
  private templates: Map<string, ResumeTemplate> = new Map();

  constructor() {
    // 注册默认模板
    this.register(classicTemplate);
    this.register(modernTemplate);
    this.register(professionalTemplate);
    this.register(minimalistTemplate);
    this.register(creativeTemplate);
  }

  register(template: ResumeTemplate): void {
    this.templates.set(template.key, template);
  }

  get(key: string): ResumeTemplate | undefined {
    return this.templates.get(key);
  }

  list(): ResumeTemplate[] {
    return Array.from(this.templates.values());
  }

  getKeys(): string[] {
    return Array.from(this.templates.keys());
  }
}

// 导出单例
export const templateRegistry = new TemplateRegistry();

// 兼容旧接口
export function buildHtmlResume(resumeJson: ResumeJson, options?: TemplateOptions): string {
  return classicTemplate.render(resumeJson, options);
}
