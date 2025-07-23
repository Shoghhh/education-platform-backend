import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Request } from 'express';
import { UserService } from '../../user/user.service';
import { CreateUserDto } from 'src/user/dto';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('FIREBASE_APP') private firebaseApp: admin.app.App,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const idToken = request.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
      throw new UnauthorizedException('No authorization token provided.');
    }

    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(idToken);
      request['user'] = decodedToken;

      if (!decodedToken.email) {
        throw new UnauthorizedException('Firebase token does not contain an email address.');
      }
      const userEmail = decodedToken.email;

      let userInDb = await this.userService.findOneByEmail(userEmail).catch(() => null);

      if (!userInDb) {
        const superAdminEmail = process.env.INITIAL_SUPER_ADMIN_EMAIL;

        if (superAdminEmail && userEmail === superAdminEmail) {
          console.log(`Auto-provisioning initial Super Admin: ${userEmail}`);
          const newAdminDto: CreateUserDto = {
            uid: decodedToken.uid,
            email: userEmail,
            name: decodedToken.name || userEmail.split('@')[0],
            role: UserRole.ADMIN,
          };
          userInDb = await this.userService.create(newAdminDto);
        } else {
          console.warn(`Attempted login by non-pre-provisioned email: ${userEmail}`);
          throw new UnauthorizedException('Access denied: User not recognized or not pre-provisioned.');
        }
      }

      if (!userInDb.uid) {
        console.log(`Linking Firebase UID ${decodedToken.uid} to pre-provisioned user: ${decodedToken.email}`);
        userInDb = await this.userService.linkFirebaseUid(userInDb.email, decodedToken.uid);
      } else if (userInDb.uid !== decodedToken.uid) {
        console.error(`Pre-provisioned user ${decodedToken.email} (UID: ${userInDb.uid})
                       attempted login with mismatched Firebase UID: ${decodedToken.uid}`);
        throw new UnauthorizedException('Authentication failed: Mismatched Firebase account.');
      }

      request['userInDb'] = userInDb;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Firebase token verification or DB lookup error:', error);
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
  }
}
