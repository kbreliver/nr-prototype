/**
 * 获取软件产品详情
 */

import { eventHandler, getRouterParam } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

// 这里应该从主文件导入，为了简化直接定义
const mockProducts = [
  {
    competitiveEdge: '功能全面、操作简单、性能优越',
    createTime: '2024-01-15 10:30:00',
    currentVersion: 'v2.1.0',
    databaseTypes: ['MySQL', 'Redis'],
    deployModes: ['云端部署', '本地部署'],
    devLanguages: ['Java', 'Vue', 'TypeScript'],
    id: 1,
    marketPosition: '面向中大型企业的运营管理系统',
    moduleCount: 12,
    productCategory: '管理系统',
    productCode: 'PRD-001',
    productIntro:
      '一站式运营管理解决方案，涵盖产品方案、市场客户、项目实施、运维服务等全流程管理',
    productName: 'OMS运营管理系统',
    productShortName: 'OMS',
    productStatus: 2,
    techArchitecture: 'B/S',
    updateTime: '2024-11-01 14:20:00',
  },
];

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const id = getRouterParam(event, 'id');
  const product = mockProducts.find((item) => item.id === Number(id));

  if (!product) {
    return useResponseError('NotFound', '产品不存在');
  }

  return useResponseSuccess(product);
});

