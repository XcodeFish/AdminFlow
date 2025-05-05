import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, IsNull } from 'typeorm';
import { DepartmentEntity } from './entities/dept.entity';
import { CreateDepartmentDto } from './dto/create-dept.dto';
import { UpdateDepartmentDto } from './dto/update-dept.dto';
import { QueryDepartmentDto } from './dto/query-dept.dto';
import { DeptTreeDto } from './dto/dept-tree.dto';
import {
  paginate,
  IPaginationOptions,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private departmentRepository: Repository<DepartmentEntity>,
  ) {}

  /**
   * 获取部门树结构
   * @param status 部门状态
   * @returns 部门树结构
   */
  async getDeptTree(status?: number): Promise<DeptTreeDto[]> {
    // 构建查询条件
    const queryOptions: any = {
      delFlag: 0,
    };
    if (status !== undefined && !isNaN(status)) {
      queryOptions.status = status;
    }

    // 查询所有部门
    const departments = await this.departmentRepository.find({
      where: queryOptions,
      order: { orderNum: 'ASC' },
    });

    // 转换为树形结构
    return this.buildDeptTree(departments);
  }

  /**
   * 构建部门树结构
   * @param departments 部门列表
   * @param parentId 父部门ID
   * @returns 部门树结构
   */
  private buildDeptTree(
    departments: DepartmentEntity[],
    parentId: string | null = null,
  ): DeptTreeDto[] {
    const result: DeptTreeDto[] = [];

    for (const dept of departments) {
      if (
        (dept.parentId === null && parentId === null) ||
        (dept.parentId !== null && dept.parentId === parentId)
      ) {
        const treeNode: DeptTreeDto = {
          id: dept.id,
          deptName: dept.deptName,
          parentId: dept.parentId,
          orderNum: dept.orderNum,
          status: dept.status,
          children: this.buildDeptTree(departments, dept.id),
        };
        result.push(treeNode);
      }
    }

    return result;
  }

  /**
   * 分页查询部门列表
   * @param queryDto 查询条件
   * @returns 分页结果
   */
  async getDeptList(
    queryDto: QueryDepartmentDto,
  ): Promise<Pagination<DepartmentEntity>> {
    const { deptName, status, page = 1, pageSize = 10 } = queryDto;

    const queryBuilder = this.departmentRepository.createQueryBuilder('dept');
    queryBuilder.where('dept.delFlag = :delFlag', { delFlag: 0 });

    if (deptName) {
      queryBuilder.andWhere('dept.deptName LIKE :deptName', {
        deptName: `%${deptName}%`,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('dept.status = :status', { status });
    }

    queryBuilder.orderBy('dept.orderNum', 'ASC');

    const options: IPaginationOptions = {
      page,
      limit: pageSize,
    };

    return paginate<DepartmentEntity>(queryBuilder, options);
  }

  /**
   * 获取部门详情
   * @param id 部门ID
   * @returns 部门详情
   */
  async getDeptById(id: string): Promise<DepartmentEntity> {
    const department = await this.departmentRepository.findOne({
      where: { id, delFlag: 0 },
    });

    if (!department) {
      throw new NotFoundException(`部门不存在`);
    }

    return department;
  }

  /**
   * 创建部门
   * @param createDto 创建部门数据
   * @returns 创建的部门
   */
  async createDept(createDto: CreateDepartmentDto): Promise<DepartmentEntity> {
    const { deptName, parentId } = createDto;

    // 检查部门名称是否重复
    const existingDept = await this.departmentRepository.findOne({
      where: { deptName, parentId, delFlag: 0 },
    });

    if (existingDept) {
      throw new BadRequestException('部门名称已存在');
    }

    // 生成祖级列表
    let ancestors = '';
    if (parentId) {
      const parentDept = await this.getDeptById(parentId);
      ancestors = parentDept.ancestors
        ? `${parentDept.ancestors},${parentDept.id}`
        : parentDept.id;

      // 检查部门层级
      if (ancestors.split(',').length >= 5) {
        throw new BadRequestException('部门层级不能超过5级');
      }
    }

    // 创建新部门
    const newDept = this.departmentRepository.create({
      ...createDto,
      ancestors,
    });

    return this.departmentRepository.save(newDept);
  }

  /**
   * 更新部门
   * @param id 部门ID
   * @param updateDto 更新部门数据
   * @returns 更新后的部门
   */
  async updateDept(
    id: string,
    updateDto: UpdateDepartmentDto,
  ): Promise<DepartmentEntity> {
    const department = await this.getDeptById(id);
    const { deptName, parentId } = updateDto;

    // 检查部门名称是否重复
    if (deptName && deptName !== department.deptName) {
      const existingDept = await this.departmentRepository.findOne({
        where: {
          deptName,
          parentId: updateDto.parentId || department.parentId,
          delFlag: 0,
          id: Not(id),
        },
      });

      if (existingDept) {
        throw new BadRequestException('部门名称已存在');
      }
    }

    // 如果修改了父部门，需要更新祖级列表
    let ancestors = department.ancestors;
    if (parentId !== undefined && parentId !== department.parentId) {
      // 检查是否将部门设置为其自身的子部门
      if (id === parentId) {
        throw new BadRequestException('不能将部门设置为其自身的子部门');
      }

      // 检查是否将部门设置为其子部门的子部门
      const childDepts = await this.departmentRepository.find({
        where: { parentId: id, delFlag: 0 },
      });
      if (childDepts.some((child) => child.id === parentId)) {
        throw new BadRequestException('不能将部门设置为其子部门的子部门');
      }

      if (parentId === null) {
        ancestors = '';
      } else {
        const parentDept = await this.getDeptById(parentId);
        ancestors = parentDept.ancestors
          ? `${parentDept.ancestors},${parentDept.id}`
          : parentDept.id;

        // 检查部门层级
        if (ancestors.split(',').length >= 5) {
          throw new BadRequestException('部门层级不能超过5级');
        }
      }

      // 更新子部门的祖级列表
      await this.updateChildrenAncestors(id, department.ancestors, ancestors);
    }

    // 更新部门
    Object.assign(department, updateDto, { ancestors });
    return this.departmentRepository.save(department);
  }

  /**
   * 更新子部门的祖级列表
   * @param parentId 父部门ID
   * @param oldAncestors 旧的祖级列表
   * @param newAncestors 新的祖级列表
   */
  private async updateChildrenAncestors(
    parentId: string,
    oldAncestors: string,
    newAncestors: string,
  ): Promise<void> {
    const childDepts = await this.departmentRepository.find({
      where: { parentId, delFlag: 0 },
    });

    for (const child of childDepts) {
      // 更新子部门的祖级列表
      const childNewAncestors = child.ancestors.replace(
        oldAncestors,
        newAncestors,
      );
      await this.departmentRepository.update(child.id, {
        ancestors: childNewAncestors,
      });

      // 递归更新子部门的子部门
      await this.updateChildrenAncestors(
        child.id,
        child.ancestors,
        childNewAncestors,
      );
    }
  }

  /**
   * 删除部门
   * @param id 部门ID
   * @returns 是否成功
   */
  async deleteDept(id: string): Promise<boolean> {
    const department = await this.getDeptById(id);

    // 检查是否有子部门
    const childDepts = await this.departmentRepository.find({
      where: { parentId: id, delFlag: 0 },
    });
    if (childDepts.length > 0) {
      throw new BadRequestException('该部门下存在子部门，无法删除');
    }

    // 检查是否有关联用户（这里假设有一个用户表与部门关联）
    // const users = await this.userRepository.find({ where: { deptId: id, delFlag: 0 } });
    // if (users.length > 0) {
    //   throw new BadRequestException('该部门下存在用户，无法删除');
    // }

    // 逻辑删除
    department.delFlag = 2;
    await this.departmentRepository.save(department);

    return true;
  }
}
