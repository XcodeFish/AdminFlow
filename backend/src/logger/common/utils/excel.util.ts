import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';

/**
 * Excel导出工具类
 */
export class ExcelExportUtil {
  /**
   * 导出数据为Excel
   * @param response Express响应对象
   * @param filename 文件名
   * @param headers 表头
   * @param data 数据
   */
  static async export(
    response: Response,
    filename: string,
    headers: { header: string; key: string; width: number }[],
    data: any[],
  ): Promise<void> {
    // 创建工作簿
    const workbook = new ExcelJS.Workbook();
    // 添加工作表
    const worksheet = workbook.addWorksheet('Sheet1');
    
    // 设置列
    worksheet.columns = headers;
    
    // 添加数据行
    worksheet.addRows(data);
    
    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // 设置内容自动换行
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          wrapText: true,
        };
      });
    });
    
    // 处理文件名
    const exportTime = format(new Date(), 'yyyyMMdd_HHmmss');
    const exportFilename = `${filename}_${exportTime}.xlsx`;
    
    // 设置响应头
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(exportFilename)}`);
    
    // 将工作簿写入响应
    await workbook.xlsx.write(response);
  }
  
  /**
   * 处理操作日志导出
   * @param response Express响应对象
   * @param logs 操作日志数据
   */
  static async exportOperationLogs(response: Response, logs: any[]): Promise<void> {
    // 定义表头
    const headers = [
      { header: '日志ID', key: 'id', width: 10 },
      { header: '操作用户', key: 'username', width: 15 },
      { header: '操作类型', key: 'operationType', width: 15 },
      { header: '操作名称', key: 'operationName', width: 20 },
      { header: '操作模块', key: 'module', width: 15 },
      { header: '操作内容', key: 'content', width: 30 },
      { header: 'IP地址', key: 'ip', width: 15 },
      { header: 'IP所属地', key: 'location', width: 15 },
      { header: '请求方法', key: 'requestMethod', width: 10 },
      { header: '请求URL', key: 'requestUrl', width: 30 },
      { header: '操作状态', key: 'status', width: 10 },
      { header: '错误信息', key: 'errorMessage', width: 30 },
      { header: '操作时间', key: 'operationTime', width: 20 },
      { header: '操作耗时(ms)', key: 'duration', width: 15 },
    ];
    
    // 处理数据，格式化日期和状态
    const formattedData = logs.map(log => {
      return {
        ...log,
        status: log.status === 1 ? '成功' : '失败',
        operationTime: log.operationTime ? format(new Date(log.operationTime), 'yyyy-MM-dd HH:mm:ss') : '',
      };
    });
    
    // 导出Excel
    await this.export(response, '操作日志', headers, formattedData);
  }
  
  /**
   * 处理接口日志导出
   * @param response Express响应对象
   * @param logs 接口日志数据
   */
  static async exportApiLogs(response: Response, logs: any[]): Promise<void> {
    // 定义表头
    const headers = [
      { header: '日志ID', key: 'id', width: 10 },
      { header: '追踪ID', key: 'traceId', width: 36 },
      { header: '请求URL', key: 'requestUrl', width: 30 },
      { header: '请求方法', key: 'requestMethod', width: 10 },
      { header: '请求IP', key: 'requestIp', width: 15 },
      { header: '用户ID', key: 'userId', width: 10 },
      { header: '用户名', key: 'username', width: 15 },
      { header: 'HTTP状态码', key: 'status', width: 15 },
      { header: '错误级别', key: 'errorLevel', width: 10 },
      { header: '错误信息', key: 'errorMessage', width: 30 },
      { header: '请求耗时(ms)', key: 'duration', width: 15 },
      { header: '请求时间', key: 'requestTime', width: 20 },
      { header: '响应时间', key: 'responseTime', width: 20 },
    ];
    
    // 处理数据，格式化日期
    const formattedData = logs.map(log => {
      return {
        ...log,
        requestTime: log.requestTime ? format(new Date(log.requestTime), 'yyyy-MM-dd HH:mm:ss') : '',
        responseTime: log.responseTime ? format(new Date(log.responseTime), 'yyyy-MM-dd HH:mm:ss') : '',
      };
    });
    
    // 导出Excel
    await this.export(response, '接口日志', headers, formattedData);
  }
}
