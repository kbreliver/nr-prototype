/**
 * 硬件设备库存管理 Mock API
 */

import { eventHandler, getQuery, readBody } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

// Mock 库存记录数据
const inventoryRecords: Record<string, any[]> = {
  '1': [
    {
      balance: 50,
      id: 1,
      operateDate: '2024-11-05',
      operateType: '出库',
      operator: '张三',
      project: 'PRJ-2024001',
      quantity: -5,
      remark: '用于智慧工厂项目',
      source: '智慧工厂项目',
    },
    {
      balance: 55,
      id: 2,
      operateDate: '2024-10-20',
      operateType: '入库',
      operator: '李四',
      project: '',
      quantity: 30,
      remark: '从供应商A采购',
      source: '供应商A采购',
    },
    {
      balance: 25,
      id: 3,
      operateDate: '2024-09-15',
      operateType: '出库',
      operator: '王五',
      project: 'PRJ-2024002',
      quantity: -10,
      remark: '用于物联网项目',
      source: '物联网项目',
    },
    {
      balance: 35,
      id: 4,
      operateDate: '2024-08-10',
      operateType: '入库',
      operator: '管理员',
      project: '',
      quantity: 35,
      remark: '初始库存',
      source: '初始库存',
    },
  ],
  '2': [
    {
      balance: 20,
      id: 1,
      operateDate: '2024-10-25',
      operateType: '出库',
      operator: '赵六',
      project: 'PRJ-2024003',
      quantity: -4,
      remark: '用于数字化车间',
      source: '数字化车间项目',
    },
    {
      balance: 24,
      id: 2,
      operateDate: '2024-09-10',
      operateType: '入库',
      operator: '李四',
      project: '',
      quantity: 15,
      remark: '从供应商B采购',
      source: '供应商B采购',
    },
    {
      balance: 9,
      id: 3,
      operateDate: '2024-07-20',
      operateType: '出库',
      operator: '王五',
      project: 'PRJ-2024004',
      quantity: -4,
      remark: '用于智能制造项目',
      source: '智能制造项目',
    },
    {
      balance: 13,
      id: 4,
      operateDate: '2024-06-01',
      operateType: '入库',
      operator: '管理员',
      project: '',
      quantity: 13,
      remark: '初始库存',
      source: '初始库存',
    },
  ],
  '3': [
    {
      balance: 10,
      id: 1,
      operateDate: '2024-10-15',
      operateType: '出库',
      operator: '张三',
      project: 'PRJ-2024005',
      quantity: -3,
      remark: '用于MES系统',
      source: 'MES系统项目',
    },
    {
      balance: 13,
      id: 2,
      operateDate: '2024-08-20',
      operateType: '入库',
      operator: '李四',
      project: '',
      quantity: 8,
      remark: '从供应商C采购',
      source: '供应商C采购',
    },
    {
      balance: 5,
      id: 3,
      operateDate: '2024-06-10',
      operateType: '出库',
      operator: '王五',
      project: 'PRJ-2024006',
      quantity: -2,
      remark: '用于SCADA系统',
      source: 'SCADA系统项目',
    },
    {
      balance: 7,
      id: 4,
      operateDate: '2024-03-01',
      operateType: '入库',
      operator: '管理员',
      project: '',
      quantity: 7,
      remark: '初始库存',
      source: '初始库存',
    },
  ],
};

// 获取库存记录
export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const method = event.method;

  // GET: 查询库存记录
  if (method === 'GET') {
    const { deviceId } = getQuery(event);

    if (!deviceId) {
      return useResponseError('设备ID不能为空');
    }

    const records = inventoryRecords[deviceId as string] || [];

    return useResponseSuccess({
      items: records,
      total: records.length,
    });
  }

  // POST: 新增库存操作
  if (method === 'POST') {
    const body = await readBody(event);
    const {
      deviceId,
      operateDate,
      operateType,
      project,
      quantity,
      remark,
      source,
    } = body;

    if (!deviceId || !operateType || !quantity) {
      return useResponseError('必填参数不能为空');
    }

    // 模拟添加记录
    const records = inventoryRecords[deviceId] || [];
    const lastBalance = records.length > 0 ? records[0].balance : 0;
    const newBalance = lastBalance + Number(quantity);

    const newRecord = {
      balance: newBalance,
      id: Date.now(),
      operateDate: operateDate || new Date().toISOString().split('T')[0],
      operateType,
      operator: userinfo.username || '当前用户',
      project: project || '',
      quantity: Number(quantity),
      remark: remark || '',
      source: source || '',
    };

    inventoryRecords[deviceId] = [newRecord, ...records];

    return useResponseSuccess(newRecord);
  }

  return useResponseError('不支持的请求方法');
});

