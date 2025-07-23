import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as admin from 'firebase-admin';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('FIREBASE_APP') private firebaseApp: admin.app.App,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new BadRequestException('User with this email is already pre-provisioned.');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneByUid(uid: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { uid } });
    if (!user) {
      throw new NotFoundException(`User with Firebase UID "${uid}" not found or not linked.`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found in pre-provisioned database.`);
    }
    return user;
  }

  async linkFirebaseUid(email: string, firebaseUid: string): Promise<User> {
    const user = await this.findOneByEmail(email);

    if (user.uid && user.uid !== firebaseUid) {
      throw new BadRequestException('User already linked to a different Firebase account.');
    }

    if (!user.uid) {
      user.uid = firebaseUid;
      return this.usersRepository.save(user);
    }
    return user;
  }

  async update(identifier: string, updateUserDto: UpdateUserDto): Promise<User> {
    let user: User | null = null;
    if (identifier.includes('@')) {
      user = await this.usersRepository.findOne({ where: { email: identifier } });
    } else {
      user = await this.usersRepository.findOne({ where: { uid: identifier } });
    }

    if (!user) {
      throw new NotFoundException(`User with identifier "${identifier}" not found.`);
    }

    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(identifier: string): Promise<void> {
    let userToDelete: User | null = null;
    if (identifier.includes('@')) {
      userToDelete = await this.usersRepository.findOne({ where: { email: identifier } });
    } else {
      userToDelete = await this.usersRepository.findOne({ where: { uid: identifier } });
    }

    if (!userToDelete) {
      throw new NotFoundException(`User with identifier "${identifier}" not found.`);
    }

    if (userToDelete.uid) {
      try {
        await this.firebaseApp.auth().deleteUser(userToDelete.uid);
        console.log(`Firebase user ${userToDelete.uid} deleted.`);
      } catch (firebaseError) {
        console.error(`Failed to delete Firebase user ${userToDelete.uid}:`, firebaseError);
        throw new BadRequestException(`Failed to delete user in Firebase: ${firebaseError.message}`);
      }
    }

    const deleteResult = await this.usersRepository.delete(userToDelete.id); 
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`User with identifier "${identifier}" not found in local DB.`);
    }
  }
}