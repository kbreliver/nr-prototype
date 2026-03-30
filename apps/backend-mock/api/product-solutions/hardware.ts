/**
 * 硬件设备库 Mock API
 */

import { eventHandler, getQuery, readBody, setResponseStatus } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

// Mock 数据
const hardwareDevices = [
  {
    brand: '品牌A',
    createBy: 1,
    createTime: '2024-01-15 10:30:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024001',
    deviceModel: 'TS-100',
    deviceName: '温度传感器',
    id: 1,
    parameters: {
      interface: 'RS485',
      powerConsumption: '5W',
      temperatureRange: '-40~80℃',
      voltage: '12-24V DC',
    },
    status: 1,
    stockQuantity: 50,
    unitPrice: 500.0,
    updateBy: 1,
    updateTime: '2024-11-05 14:20:00',
    usageCount: 15,
  },
  {
    brand: '品牌B',
    createBy: 1,
    createTime: '2024-01-20 09:15:00',
    deviceCategory: '网关',
    deviceCode: 'HD-2024002',
    deviceModel: 'GW-200',
    deviceName: '工业网关',
    id: 2,
    parameters: {
      interface: '以太网/4G',
      memory: '2GB',
      ports: '8个串口',
      voltage: '220V AC',
    },
    status: 1,
    stockQuantity: 20,
    unitPrice: 2000.0,
    updateBy: 1,
    updateTime: '2024-10-28 16:45:00',
    usageCount: 8,
  },
  {
    brand: '品牌C',
    createBy: 1,
    createTime: '2024-02-10 11:20:00',
    deviceCategory: '服务器',
    deviceCode: 'HD-2024003',
    deviceModel: 'SR-300',
    deviceName: '工业服务器',
    id: 3,
    parameters: {
      cpu: 'Intel Xeon E5',
      disk: '2TB SSD',
      memory: '64GB',
      voltage: '220V AC',
    },
    status: 2,
    stockQuantity: 10,
    unitPrice: 8000.0,
    updateBy: 1,
    updateTime: '2024-10-25 10:15:00',
    usageCount: 5,
  },
  {
    brand: '品牌D',
    createBy: 1,
    createTime: '2024-02-15 14:30:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024004',
    deviceModel: 'HS-150',
    deviceName: '湿度传感器',
    id: 4,
    parameters: {
      accuracy: '±2%RH',
      interface: 'RS485',
      range: '0-100%RH',
      voltage: '12-24V DC',
    },
    status: 1,
    stockQuantity: 35,
    unitPrice: 450.0,
    updateBy: 1,
    updateTime: '2024-11-02 09:30:00',
    usageCount: 12,
  },
  {
    brand: '品牌E',
    createBy: 1,
    createTime: '2024-03-01 08:45:00',
    deviceCategory: 'PLC',
    deviceCode: 'HD-2024005',
    deviceModel: 'PLC-500',
    deviceName: '可编程控制器',
    id: 5,
    parameters: {
      interface: '以太网/串口',
      io: '32路输入/32路输出',
      memory: '256KB',
      voltage: '24V DC',
    },
    status: 1,
    stockQuantity: 15,
    unitPrice: 3500.0,
    updateBy: 1,
    updateTime: '2024-10-30 11:20:00',
    usageCount: 6,
  },
  {
    brand: '品牌F',
    createBy: 1,
    createTime: '2024-03-15 10:00:00',
    deviceCategory: '摄像头',
    deviceCode: 'HD-2024006',
    deviceModel: 'CAM-400',
    deviceName: '工业摄像头',
    id: 6,
    parameters: {
      interface: '以太网',
      lens: '8mm',
      resolution: '4K',
      voltage: '12V DC/PoE',
    },
    status: 1,
    stockQuantity: 25,
    unitPrice: 1200.0,
    updateBy: 1,
    updateTime: '2024-09-20 15:30:00',
    usageCount: 10,
  },
  {
    brand: '品牌G',
    createBy: 1,
    createTime: '2024-04-01 13:15:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024007',
    deviceModel: 'PS-250',
    deviceName: '压力传感器',
    id: 7,
    parameters: {
      accuracy: '±0.5%FS',
      interface: '4-20mA',
      range: '0-10MPa',
      voltage: '24V DC',
    },
    status: 1,
    stockQuantity: 40,
    unitPrice: 600.0,
    updateBy: 1,
    updateTime: '2024-11-05 16:40:00',
    usageCount: 18,
  },
  {
    brand: '品牌H',
    createBy: 1,
    createTime: '2024-04-20 09:30:00',
    deviceCategory: '显示器',
    deviceCode: 'HD-2024008',
    deviceModel: 'MON-700',
    deviceName: '工业显示器',
    id: 8,
    parameters: {
      brightness: '500cd/m²',
      interface: 'VGA/HDMI',
      resolution: '1920x1080',
      size: '21.5寸',
      voltage: '220V AC',
    },
    status: 1,
    stockQuantity: 18,
    unitPrice: 1500.0,
    updateBy: 1,
    updateTime: '2024-06-15 10:00:00',
    usageCount: 7,
  },
  {
    brand: '品牌I',
    createBy: 1,
    createTime: '2024-05-10 15:20:00',
    deviceCategory: '交换机',
    deviceCode: 'HD-2024009',
    deviceModel: 'SW-800',
    deviceName: '工业交换机',
    id: 9,
    parameters: {
      interface: '24口千兆',
      management: '网管型',
      powerConsumption: '30W',
      voltage: '220V AC',
    },
    status: 1,
    stockQuantity: 12,
    unitPrice: 2500.0,
    updateBy: 1,
    updateTime: '2024-11-03 14:10:00',
    usageCount: 9,
  },
  {
    brand: '品牌J',
    createBy: 1,
    createTime: '2024-06-01 11:45:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024010',
    deviceModel: 'VS-350',
    deviceName: '振动传感器',
    id: 10,
    parameters: {
      frequency: '10Hz-10kHz',
      interface: '4-20mA',
      sensitivity: '100mV/g',
      voltage: '24V DC',
    },
    status: 1,
    stockQuantity: 30,
    unitPrice: 800.0,
    updateBy: 1,
    updateTime: '2024-11-04 09:25:00',
    usageCount: 11,
  },
];

// 获取硬件设备列表
export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    current = 1,
    deviceCategory,
    deviceCode,
    deviceName,
    pageSize = 10,
    status,
  } = getQuery(event);

  let filteredData = [...hardwareDevices];

  // 按条件筛选
  if (deviceName && typeof deviceName === 'string') {
    filteredData = filteredData.filter((item) =>
      item.deviceName.includes(deviceName),
    );
  }
  if (deviceCode && typeof deviceCode === 'string') {
    filteredData = filteredData.filter((item) =>
      item.deviceCode.includes(deviceCode),
    );
  }
  if (deviceCategory && typeof deviceCategory === 'string') {
    filteredData = filteredData.filter(
      (item) => item.deviceCategory === deviceCategory,
    );
  }
  if (status) {
    filteredData = filteredData.filter(
      (item) => item.status === Number(status),
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

