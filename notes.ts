// // src/some-module/some.controller.ts
// import { Controller, Get, UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Adjust path

// @UseGuards(JwtAuthGuard) // Protects ALL methods in this controller
// @Controller('protected-resource')
// export class ProtectedResourceController {
//   @Get()
//   getProtectedData() {
//     return 'This data is only accessible to authenticated users.';
//   }
// }


// // src/some-module/some.controller.ts
// import { Controller, Get, UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Adjust path

// @Controller('mixed-resource')
// export class MixedResourceController {
//   @Get('public')
//   getPublicData() {
//     return 'This data is public.';
//   }

//   @UseGuards(JwtAuthGuard) // Only this method requires authentication
//   @Get('auth-only')
//   getAuthOnlyData() {
//     return 'This data requires authentication.';
//   }
// }


// // src/course/course.controller.ts (Example)
// import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';
// import { UserRole } from '../../common/enums/user-role.enum';
// import { CourseService } from './course.service';
// import { CreateCourseDto } from './dto/course.dto';
// import { Request } from 'express'; // For accessing req.userInDb

// @Controller('courses')
// @UseGuards(JwtAuthGuard, RolesGuard) // Apply both guards to the controller
// export class CourseController {
//   constructor(private readonly courseService: CourseService) {}

//   @Get()
//   // No @Roles() decorator means anyone authenticated (student or lecturer) can view courses
//   findAllCourses() {
//     return this.courseService.findAll();
//   }

//   @Post()
//   @Roles(UserRole.LECTURER) // Only lecturers can create courses
//   createCourse(@Body() createCourseDto: CreateCourseDto, @Req() req: Request) {
//     // Access the authenticated lecturer's UID if needed, e.g., to set 'createdBy'
//     const lecturerId = req['userInDb'].uid;
//     return this.courseService.create(createCourseDto, lecturerId);
//   }

//   @Get('my-taught-courses')
//   @Roles(UserRole.LECTURER) // Only lecturers can view courses they teach
//   findMyTaughtCourses(@Req() req: Request) {
//     const lecturerId = req['userInDb'].uid;
//     return this.courseService.findCoursesByLecturer(lecturerId);
//   }

//   @Get('my-enrolled-courses')
//   @Roles(UserRole.STUDENT) // Only students can view courses they are enrolled in
//   findMyEnrolledCourses(@Req() req: Request) {
//     const studentUid = req['userInDb'].uid;
//     const studentGroup = req['userInDb'].studentGroup; // Access other student details
//     // You'd need a service method like findCoursesByStudentDetails
//     return this.courseService.findCoursesByStudentDetails(studentUid, studentGroup /* etc. */);
//   }
// }