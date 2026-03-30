/**
 * 软件产品库 Mock API
 */

import { eventHandler, getQuery, readBody, setResponseStatus } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

// Mock 数据
const softwareProducts = [
  {
    competitiveEdge: '功能全面、操作简单、性能优越',
    createBy: 1,
    createTime: '2024-01-15 10:30:00',
    currentVersion: 'v2.1.0',
    databaseTypes: ['MySQL', 'Redis'],
    deployModes: ['云端部署', '本地部署'],
    devLanguages: ['Java', 'Vue', 'TypeScript'],
    id: 1,
    licenseTypes: ['永久授权', '订阅模式'],
    marketPosition: '面向中大型企业的运营管理系统',
    moduleCount: 12,
    productCategory: '管理系统',
    productCategoryId: 1,
    productCode: 'PRD-001',
    productIcon: '',
    productIntro:
      '一站式运营管理解决方案，涵盖产品方案、市场客户、项目实施、运维服务等全流程管理',
    productManagerId: 1,
    productName: 'OMS运营管理系统',
    productShortName: 'OMS',
    productStatus: 2,
    tags: ['企业管理', '运营', 'SaaS'],
    techArchitecture: 'B/S',
    techManagerId: 2,
    updateBy: 1,
    updateTime: '2024-11-01 14:20:00',
  },
  {
    competitiveEdge: '模块化设计、灵活配置、高度集成',
    createBy: 1,
    createTime: '2024-02-10 09:15:00',
    currentVersion: 'v3.0.5',
    databaseTypes: ['Oracle', 'MySQL'],
    deployModes: ['本地部署'],
    devLanguages: ['Java', 'Angular'],
    id: 2,
    licenseTypes: ['订阅模式', '按量计费'],
    marketPosition: '大型企业的资源计划管理核心系统',
    moduleCount: 18,
    productCategory: '管理系统',
    productCategoryId: 1,
    productCode: 'PRD-002',
    productIcon: '',
    productIntro: '企业资源计划系统，包括财务、人力、供应链等核心模块',
    productManagerId: 2,
    productName: 'ERP企业资源计划',
    productShortName: 'ERP',
    productStatus: 2,
    tags: ['ERP', '资源管理', '企业级'],
    techArchitecture: 'B/S',
    techManagerId: 3,
    updateBy: 1,
    updateTime: '2024-10-28 16:45:00',
  },
  {
    competitiveEdge: '智能分析、客户画像、营销自动化',
    createBy: 1,
    createTime: '2024-03-05 11:20:00',
    currentVersion: 'v1.5.2',
    databaseTypes: ['MySQL'],
    deployModes: ['云端部署'],
    devLanguages: ['Python', 'React'],
    id: 3,
    licenseTypes: ['永久授权'],
    marketPosition: '中小企业的客户关系管理首选',
    moduleCount: 8,
    productCategory: '协同办公',
    productCategoryId: 2,
    productCode: 'PRD-003',
    productIcon: '',
    productIntro:
      '客户关系管理系统，帮助企业管理客户信息、销售线索、商机跟进',
    productManagerId: 1,
    productName: 'CRM客户关系管理',
    productShortName: 'CRM',
    productStatus: 2,
    tags: ['CRM', '销售管理', '客户管理'],
    techArchitecture: 'B/S',
    techManagerId: 2,
    updateBy: 1,
    updateTime: '2024-10-25 10:15:00',
  },
  {
    competitiveEdge: '实时分析、可视化大屏、AI预测',
    createBy: 1,
    createTime: '2024-04-12 14:30:00',
    currentVersion: 'v0.8.0',
    databaseTypes: ['ClickHouse', 'MongoDB'],
    deployModes: ['云端部署', '混合部署'],
    devLanguages: ['Python', 'Vue'],
    id: 4,
    licenseTypes: ['订阅模式'],
    marketPosition: '企业数据分析和决策支持平台',
    moduleCount: 6,
    productCategory: '数据分析',
    productCategoryId: 3,
    productCode: 'PRD-004',
    productIcon: '',
    productIntro: '商业智能分析平台，提供数据可视化、报表分析、决策支持',
    productManagerId: 3,
    productName: 'BI商业智能平台',
    productShortName: 'BI',
    productStatus: 1,
    tags: ['BI', '数据分析', '可视化'],
    techArchitecture: 'B/S',
    techManagerId: 1,
    updateBy: 1,
    updateTime: '2024-11-02 09:30:00',
  },
  {
    competitiveEdge: '移动办公、流程审批、协同高效',
    createBy: 1,
    createTime: '2024-01-20 08:45:00',
    currentVersion: 'v2.3.1',
    databaseTypes: ['MySQL'],
    deployModes: ['云端部署'],
    devLanguages: ['Java', 'Vue'],
    id: 5,
    licenseTypes: ['订阅模式', '按量计费'],
    marketPosition: '中小企业协同办公解决方案',
    moduleCount: 10,
    productCategory: '协同办公',
    productCategoryId: 2,
    productCode: 'PRD-005',
    productIcon: '',
    productIntro: '协同办公系统，支持流程审批、公文管理、移动办公',
    productManagerId: 2,
    productName: 'OA协同办公系统',
    productShortName: 'OA',
    productStatus: 2,
    tags: ['OA', '协同', '移动办公'],
    techArchitecture: 'B/S',
    techManagerId: 3,
    updateBy: 1,
    updateTime: '2024-10-30 11:20:00',
  },
  {
    competitiveEdge: '敏捷管理、可视化看板、团队协作',
    createBy: 1,
    createTime: '2023-11-15 10:00:00',
    currentVersion: 'v1.2.0',
    databaseTypes: ['PostgreSQL'],
    deployModes: ['本地部署', '云端部署'],
    devLanguages: ['Node.js', 'React'],
    id: 6,
    licenseTypes: ['永久授权'],
    marketPosition: '软件团队项目管理工具',
    moduleCount: 5,
    productCategory: '工具软件',
    productCategoryId: 4,
    productCode: 'PRD-006',
    productIcon: '',
    productIntro: '项目管理工具，支持敏捷开发、任务跟踪、进度管理',
    productManagerId: 1,
    productName: '项目管理工具',
    productShortName: 'PM',
    productStatus: 3,
    tags: ['项目管理', '敏捷', '协作'],
    techArchitecture: 'B/S',
    techManagerId: 2,
    updateBy: 1,
    updateTime: '2024-09-20 15:30:00',
  },
  {
    competitiveEdge: '大数据处理、分布式计算、机器学习',
    createBy: 1,
    createTime: '2024-05-08 13:15:00',
    currentVersion: 'v0.5.0',
    databaseTypes: ['Hadoop', 'Spark'],
    deployModes: ['云端部署'],
    devLanguages: ['Python', 'Scala'],
    id: 7,
    licenseTypes: ['订阅模式'],
    marketPosition: '企业级大数据分析平台',
    moduleCount: 7,
    productCategory: '数据分析',
    productCategoryId: 3,
    productCode: 'PRD-007',
    productIcon: '',
    productIntro:
      '大数据分析平台，支持海量数据处理、实时分析、机器学习',
    productManagerId: 3,
    productName: '大数据分析平台',
    productShortName: 'BigData',
    productStatus: 1,
    tags: ['大数据', 'AI', '机器学习'],
    techArchitecture: '分布式',
    techManagerId: 1,
    updateBy: 1,
    updateTime: '2024-11-05 16:40:00',
  },
  {
    competitiveEdge: '全文检索、版本控制、权限管理',
    createBy: 1,
    createTime: '2023-08-20 09:30:00',
    currentVersion: 'v1.0.0',
    databaseTypes: ['MySQL', 'Elasticsearch'],
    deployModes: ['本地部署'],
    devLanguages: ['Java', 'Vue'],
    id: 8,
    licenseTypes: ['永久授权'],
    marketPosition: '企业文档知识管理系统',
    moduleCount: 4,
    productCategory: '工具软件',
    productCategoryId: 4,
    productCode: 'PRD-008',
    productIcon: '',
    productIntro: '文档管理系统，支持文档存储、检索、共享、协作',
    productManagerId: 2,
    productName: '文档管理系统',
    productShortName: 'DMS',
    productStatus: 4,
    tags: ['文档', '知识管理', '协作'],
    techArchitecture: 'B/S',
    techManagerId: 3,
    updateBy: 1,
    updateTime: '2024-06-15 10:00:00',
  },
  {
    competitiveEdge: '供应链可视化、智能调度、风险预警',
    createBy: 1,
    createTime: '2024-06-01 15:20:00',
    currentVersion: 'v1.8.3',
    databaseTypes: ['Oracle'],
    deployModes: ['本地部署', '混合部署'],
    devLanguages: ['Java'],
    id: 9,
    licenseTypes: ['订阅模式', '按量计费'],
    marketPosition: '制造企业供应链管理系统',
    moduleCount: 15,
    productCategory: '管理系统',
    productCategoryId: 1,
    productCode: 'PRD-009',
    productIcon: '',
    productIntro: '供应链管理系统，覆盖采购、库存、物流、销售全链条',
    productManagerId: 1,
    productName: 'SCM供应链管理',
    productShortName: 'SCM',
    productStatus: 2,
    tags: ['供应链', '物流', '库存'],
    techArchitecture: 'B/S',
    techManagerId: 2,
    updateBy: 1,
    updateTime: '2024-11-03 14:10:00',
  },
  {
    competitiveEdge: '人才管理、绩效考核、智能排班',
    createBy: 1,
    createTime: '2024-07-10 11:45:00',
    currentVersion: 'v2.0.0',
    databaseTypes: ['MySQL'],
    deployModes: ['云端部署'],
    devLanguages: ['Java', 'Vue'],
    id: 10,
    licenseTypes: ['永久授权'],
    marketPosition: '企业人力资源管理系统',
    moduleCount: 9,
    productCategory: '协同办公',
    productCategoryId: 2,
    productCode: 'PRD-010',
    productIcon: '',
    productIntro: '人力资源管理系统，包括招聘、培训、绩效、薪酬等模块',
    productManagerId: 2,
    productName: 'HRM人力资源管理',
    productShortName: 'HRM',
    productStatus: 2,
    tags: ['人力资源', 'HR', '绩效'],
    techArchitecture: 'B/S',
    techManagerId: 3,
    updateBy: 1,
    updateTime: '2024-11-04 09:25:00',
  },
];

// 获取软件产品列表
export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    current = 1,
    licenseTypes,
    pageSize = 10,
    productCategory,
    productCode,
    productName,
    productStatus,
  } = getQuery(event);

  let filteredData = [...softwareProducts];

  // 按条件筛选
  if (productName && typeof productName === 'string') {
    filteredData = filteredData.filter((item) =>
      item.productName.includes(productName),
    );
  }
  if (productCode && typeof productCode === 'string') {
    filteredData = filteredData.filter((item) =>
      item.productCode.includes(productCode),
    );
  }
  if (productCategory && typeof productCategory === 'string') {
    filteredData = filteredData.filter(
      (item) => item.productCategory === productCategory,
    );
  }
  if (productStatus) {
    filteredData = filteredData.filter(
      (item) => item.productStatus === Number(productStatus),
    );
  }
  if (licenseTypes && typeof licenseTypes === 'string') {
    filteredData = filteredData.filter((item) =>
      item.licenseTypes.includes(licenseTypes),
    );
  }

  // 分页
  const currentPage = Number(current) || 1;
  const size = Number(pageSize) || 10;
  const start = (currentPage - 1) * size;
  const end = start + size;
  const pagedData = filteredData.slice(start, end);

  return useResponseSuccess({
    items: pagedData,
    page: currentPage,
    pageSize: size,
    total: filteredData.length,
  });
});
