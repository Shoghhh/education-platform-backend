import 'reflect-metadata'; // Must be imported first
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { AcademicPeriod } from '../academic-period/entities/academic-period.entity';
import { TimeSlot } from '../time-slot/entities/time-slot.entity';

dotenv.config();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'your_db_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  database: process.env.DB_NAME || 'education_platform_db',

  entities: [
    User,
    Course,
    AcademicPeriod,
    TimeSlot
  ],

  synchronize: false,
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/../database/migrations/*.ts'],

  logging: ['query', 'error'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;