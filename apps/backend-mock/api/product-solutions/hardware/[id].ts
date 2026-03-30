/**
 * 硬件设备详情 Mock API
 */

import { eventHandler, getRouterParam } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

// Mock 设备详细数据
const deviceDetails: Record<string, any> = {
  '1': {
    brand: '品牌A',
    createBy: 1,
    createByName: '张三',
    createTime: '2024-01-15 10:30:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024001',
    deviceModel: 'TS-100',
    deviceName: '温度传感器',
    id: 1,
    parameters: {
      accuracy: '±0.5℃',
      interface: 'RS485',
      powerConsumption: '5W',
      responseTime: '1秒',
      temperatureRange: '-40~80℃',
      voltage: '12-24V DC',
    },
    remark: '高精度工业温度传感器，适用于各种工业环境',
    specification: '采用进口高精度温感元件，抗干扰能力强',
    status: 1,
    stockQuantity: 50,
    unitPrice: 500.0,
    updateBy: 1,
    updateByName: '李四',
    updateTime: '2024-11-05 14:20:00',
    usageCount: 15,
    usageRecords: [
      {
        customer: '智慧工厂项目',
        deployDate: '2024-10-20',
        id: 1,
        project: 'PRJ-2024001',
        quantity: 10,
        status: '使用中',
      },
      {
        customer: '物联网平台项目',
        deployDate: '2024-09-15',
        id: 2,
        project: 'PRJ-2024002',
        quantity: 5,
        status: '使用中',
      },
    ],
  },
  '2': {
    brand: '品牌B',
    createBy: 1,
    createByName: '张三',
    createTime: '2024-01-20 09:15:00',
    deviceCategory: '网关',
    deviceCode: 'HD-2024002',
    deviceModel: 'GW-200',
    deviceName: '工业网关',
    id: 2,
    parameters: {
      cpu: 'ARM Cortex-A7',
      interface: '以太网/4G/Wi-Fi',
      memory: '2GB DDR3',
      operatingTemp: '-40~70℃',
      ports: '8个RS485串口',
      storage: '8GB eMMC',
      voltage: '220V AC',
    },
    remark: '多协议工业网关，支持边缘计算',
    specification: '支持Modbus、MQTT等多种工业协议，内置边缘计算功能',
    status: 1,
    stockQuantity: 20,
    unitPrice: 2000.0,
    updateBy: 1,
    updateByName: '李四',
    updateTime: '2024-10-28 16:45:00',
    usageCount: 8,
    usageRecords: [
      {
        customer: '数字化车间项目',
        deployDate: '2024-08-10',
        id: 1,
        project: 'PRJ-2024003',
        quantity: 4,
        status: '使用中',
      },
      {
        customer: '智能制造项目',
        deployDate: '2024-07-05',
        id: 2,
        project: 'PRJ-2024004',
        quantity: 4,
        status: '使用中',
      },
    ],
  },
  '3': {
    brand: '品牌C',
    createBy: 1,
    createByName: '张三',
    createTime: '2024-02-10 11:20:00',
    deviceCategory: '服务器',
    deviceCode: 'HD-2024003',
    deviceModel: 'SR-300',
    deviceName: '工业服务器',
    id: 3,
    parameters: {
      cpu: 'Intel Xeon E5-2680 v4',
      disk: '2TB SSD RAID1',
      memory: '64GB DDR4 ECC',
      network: '双千兆网口',
      operatingTemp: '10~35℃',
      powerSupply: '冗余电源',
      voltage: '220V AC',
    },
    remark: '高性能工业级服务器',
    specification: '采用工业级主板，支持7x24小时不间断运行',
    status: 2,
    stockQuantity: 10,
    unitPrice: 8000.0,
    updateBy: 1,
    updateByName: '李四',
    updateTime: '2024-10-25 10:15:00',
    usageCount: 5,
    usageRecords: [
      {
        customer: 'MES系统项目',
        deployDate: '2024-06-20',
        id: 1,
        project: 'PRJ-2024005',
        quantity: 3,
        status: '使用中',
      },
      {
        customer: 'SCADA系统项目',
        deployDate: '2024-05-15',
        id: 2,
        project: 'PRJ-2024006',
        quantity: 2,
        status: '已停用',
      },
    ],
  },
};

// 获取设备详情
export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const id = getRouterParam(event, 'id');

  if (!id || !deviceDetails[id]) {
    return useResponseError('设备不存在', null, 404);
  }

  return useResponseSuccess(deviceDetails[id]);
});

