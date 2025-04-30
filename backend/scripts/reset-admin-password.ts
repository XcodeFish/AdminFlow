// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../';
// import { Repository } from 'typeorm';
// import { UserEntity } from '../modules/system/user/entities/user.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import * as bcrypt from 'bcrypt';

// /**
//  * 重置admin用户密码的脚本
//  * 运行方式: npx ts-node src/scripts/reset-admin-password.ts
//  */
// async function resetAdminPassword() {
//   const app = await NestFactory.createApplicationContext(AppModule);

//   try {
//     const userRepository = app.get<Repository<UserEntity>>(
//       getRepositoryToken(UserEntity),
//     );

//     // 查找admin用户
//     const adminUser = await userRepository.findOne({
//       where: { username: 'admin' },
//     });

//     if (!adminUser) {
//       console.error('未找到admin用户，请先运行数据库初始化');
//       return;
//     }

//     // 设置新密码并哈希
//     const newPassword = 'Admin123456';
//     adminUser.password = await bcrypt.hash(newPassword, 10);

//     // 保存到数据库
//     await userRepository.save(adminUser);

//     console.log(`管理员密码已重置为: ${newPassword}`);
//     console.log('请登录后立即修改密码!');
//   } catch (error) {
//     console.error('重置密码过程中发生错误:', error);
//   } finally {
//     await app.close();
//   }
// }

// resetAdminPassword().catch((err) => {
//   console.error('脚本执行失败:', err);
//   process.exit(1);
// });
