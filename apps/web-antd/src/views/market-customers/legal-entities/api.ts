/**
 * 法人组织管理 - API接口
 * 
 * 包含：
 * 1. 第三方数据提供者接口定义
 * 2. 企查查、天眼查等第三方接口对接（预留）
 * 3. API管理器
 */

import type { LegalEntity, ThirdPartyEntityData } from './types';
import { DataSource, LegalEntityType } from './types';

/**
 * 第三方数据提供者接口
 */
export interface ThirdPartyProvider {
  name: string; // 提供者名称（企查查、天眼查等）
  
  /**
   * 根据统一社会信用代码查询企业信息
   */
  fetchEntity(creditCode: string): Promise<ThirdPartyEntityData>;
  
  /**
   * 获取企业股权结构
   */
  fetchHierarchy(creditCode: string): Promise<ThirdPartyEntityData[]>;
}

/**
 * 企查查提供者实现（示例）
 */
export class QiChaChaProvider implements ThirdPartyProvider {
  name = '企查查';
  
  async fetchEntity(creditCode: string): Promise<ThirdPartyEntityData> {
    // TODO: 调用企查查API
    // const response = await fetch(`https://api.qichacha.com/entity/${creditCode}`);
    // return response.json();
    
    // 暂时返回Mock数据
    return {
      name: '示例企业名称',
      creditCode,
      legalRepresentative: '张三',
      registeredCapital: '1000万元',
      establishDate: '2020-01-01',
      address: '北京市朝阳区XX路XX号',
      businessScope: '技术开发、技术服务',
      industry: '信息技术',
      contactPhone: '010-12345678',
      shareholders: [
        {
          name: '股东A',
          creditCode: '91110000MA00000001',
          shareholdingRatio: 60,
        },
        {
          name: '股东B',
          shareholdingRatio: 40,
        },
      ],
    };
  }
  
  async fetchHierarchy(creditCode: string): Promise<ThirdPartyEntityData[]> {
    // TODO: 调用企查查股权结构API
    // const response = await fetch(`https://api.qichacha.com/hierarchy/${creditCode}`);
    // return response.json();
    
    // 暂时返回Mock数据
    return [
      {
        name: '上级公司',
        creditCode: '91110000MA00000001',
        legalRepresentative: '李四',
        registeredCapital: '10000万元',
        establishDate: '2015-01-01',
        address: '北京市朝阳区XX路XX号',
        businessScope: '投资管理',
      },
    ];
  }
}

/**
 * 天眼查提供者实现（示例）
 */
export class TianYanChaProvider implements ThirdPartyProvider {
  name = '天眼查';
  
  async fetchEntity(creditCode: string): Promise<ThirdPartyEntityData> {
    // TODO: 调用天眼查API
    // const response = await fetch(`https://api.tianyancha.com/entity/${creditCode}`);
    // return response.json();
    
    // 暂时返回Mock数据
    return {
      name: '示例企业名称',
      creditCode,
      legalRepresentative: '张三',
      registeredCapital: '1000万元',
      establishDate: '2020-01-01',
      address: '北京市朝阳区XX路XX号',
      businessScope: '技术开发、技术服务',
      industry: '信息技术',
      contactPhone: '010-12345678',
    };
  }
  
  async fetchHierarchy(creditCode: string): Promise<ThirdPartyEntityData[]> {
    // TODO: 调用天眼查股权结构API
    return [];
  }
}

/**
 * 第三方数据转换为内部格式
 */
export function convertThirdPartyData(data: ThirdPartyEntityData, entityLevel: number = 1): LegalEntity {
  return {
    entityCode: '', // 需要生成
    entityName: data.name,
    entityShortName: undefined,
    creditCode: data.creditCode,
    legalRepresentative: data.legalRepresentative,
    registeredCapital: data.registeredCapital,
    establishDate: data.establishDate,
    address: data.address,
    parentEntityId: undefined,
    entityLevel,
    entityType: entityLevel === 1 ? LegalEntityType.GroupHeadquarters : LegalEntityType.Subsidiary,
    isCustomer: false,
    industry: data.industry,
    businessScope: data.businessScope,
    contactPhone: data.contactPhone,
    dataSource: DataSource.ThirdParty,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  };
}

/**
 * 第三方API管理器
 */
export class ThirdPartyAPIManager {
  private providers: Map<string, ThirdPartyProvider>;
  
  constructor() {
    this.providers = new Map();
    
    // 注册默认提供者
    this.register(new QiChaChaProvider());
    this.register(new TianYanChaProvider());
  }
  
  /**
   * 注册提供者
   */
  register(provider: ThirdPartyProvider): void {
    this.providers.set(provider.name, provider);
  }
  
  /**
   * 获取提供者
   */
  getProvider(name: string): ThirdPartyProvider | undefined {
    return this.providers.get(name);
  }
  
  /**
   * 获取所有提供者名称
   */
  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }
  
  /**
   * 从第三方获取企业数据
   */
  async fetchFromThirdParty(providerName: string, creditCode: string): Promise<LegalEntity> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`找不到提供者：${providerName}`);
    }
    
    const data = await provider.fetchEntity(creditCode);
    return convertThirdPartyData(data);
  }
  
  /**
   * 从第三方获取企业层级结构
   */
  async fetchHierarchyFromThirdParty(providerName: string, creditCode: string): Promise<LegalEntity[]> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`找不到提供者：${providerName}`);
    }
    
    const dataList = await provider.fetchHierarchy(creditCode);
    return dataList.map((data, index) => convertThirdPartyData(data, index + 1));
  }
}

// 导出单例
export const thirdPartyAPIManager = new ThirdPartyAPIManager();

