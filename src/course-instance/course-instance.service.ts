import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseInstanceDto } from './dto/create-course-instance.dto';
import { UpdateCourseInstanceDto } from './dto/update-course-instance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseInstance } from './entities/course-instance.entity';
import { Repository } from 'typeorm';
import { CourseService } from 'src/course/course.service';
import { AcademicPeriodService } from 'src/academic-period/academic-period.service';
import { UserService } from 'src/user/user.service';
import { FacultyService } from 'src/faculty/faculty.service';
import { ResourceService } from 'src/resource/resource.service';
import { Course } from 'src/course/entities/course.entity';
import { AcademicPeriod } from 'src/academic-period/entities/academic-period.entity';
import { User } from 'src/user/entities/user.entity';
import { Faculty } from 'src/faculty/entities/faculty.entity';
import { Resource } from 'src/resource/entities/resource.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class CourseInstanceService {
  constructor(
    @InjectRepository(CourseInstance)
    private courseInstancesRepository: Repository<CourseInstance>,
    private courseService: CourseService,
    private academicPeriodService: AcademicPeriodService,
    private userService: UserService,
    private facultyService: FacultyService,
    private resourceService: ResourceService,
  ) { }

  private async getRelatedEntities(dto: CreateCourseInstanceDto | UpdateCourseInstanceDto): Promise<{
    course?: Course;
    academicPeriod?: AcademicPeriod;
    lecturer?: User | null;
    faculty?: Faculty;
    resources: Resource[];
  }> {
    const related: any = {};

    // Use Promise.all to fetch related entities concurrently
    const [course, academicPeriod, lecturer, faculty] = await Promise.all([
      dto.courseId ? this.courseService.findOne(dto.courseId) : Promise.resolve(undefined),
      dto.academicPeriodId ? this.academicPeriodService.findOne(dto.academicPeriodId) : Promise.resolve(undefined),
      // LECTURER: Fetch if UID is provided AND not null. If UID is explicitly null, resolve with null.
      dto.lecturerUid === null ? Promise.resolve(null) : (dto.lecturerUid ? this.userService.findOneByUid(dto.lecturerUid) : Promise.resolve(undefined)),
      // FACULTY: Fetch if code is provided.
      dto.facultyCode ? this.facultyService.findOneByCode(dto.facultyCode) : Promise.resolve(undefined),
    ]);

    if (course) {
      related.course = course;
    } else if (dto.courseId) { // Course ID was provided but not found
      throw new NotFoundException(`Course with ID "${dto.courseId}" not found.`);
    }

    if (academicPeriod) {
      related.academicPeriod = academicPeriod;
    } else if (dto.academicPeriodId) { // Academic Period ID was provided but not found
      throw new NotFoundException(`Academic Period with ID "${dto.academicPeriodId}" not found.`);
    }

    // LECTURER: Handle found lecturer, not found (if UID provided), or explicit null
    if (lecturer) {
      if (lecturer.role !== UserRole.LECTURER) {
        throw new BadRequestException('Assigned lecturer UID must belong to a lecturer role.');
      }
      related.lecturer = lecturer;
    } else if (dto.lecturerUid !== undefined && dto.lecturerUid !== null) {
      // lecturerUid was provided but the user was not found
      throw new NotFoundException(`Lecturer with UID "${dto.lecturerUid}" not found.`);
    } else if (dto.lecturerUid === null) {
      // lecturerUid was explicitly set to null in DTO
      related.lecturer = null;
    }
    // If dto.lecturerUid is undefined, related.lecturer remains undefined, which is fine for optional updates.


    // FACULTY: Handle found faculty or not found (facultyCode is always expected if present in DTO)
    if (faculty) {
      related.faculty = faculty;
    } else if (dto.facultyCode) { // facultyCode was provided but not found
      throw new NotFoundException(`Faculty with code "${dto.facultyCode}" not found.`);
    }
    // If dto.facultyCode is undefined, related.faculty remains undefined, which is fine for optional updates.


    // Only attempt to fetch resources if resourceIds are explicitly provided in the DTO
    if (dto.resourceIds !== undefined) {
      const fetchedResources = await Promise.all(
        dto.resourceIds.map(id => this.resourceService.findOne(id))
      );
      const validResources = fetchedResources.filter((r): r is Resource => r !== undefined && r !== null);
      if (validResources.length !== dto.resourceIds.length) {
        const notFoundIds = dto.resourceIds.filter(id => !fetchedResources.some(r => r?.id === id));
        throw new BadRequestException(`One or more resource IDs not found: ${notFoundIds.join(', ')}`);
      }
      related.resources = validResources;
    } else {
      related.resources = [];
    }
    return related;
  }

  // Helper to check the composite unique constraint
  private async checkCompositeUniqueConstraint(
    courseId: string,
    academicPeriodId: string,
    facultyCode: string,
    studentGroup: number,
    targetYear: number,
    excludeId?: string // Exclude the current instance's ID during update checks
  ): Promise<void> {
    const query: any = {
      course: { id: courseId },
      academicPeriod: { id: academicPeriodId },
      faculty: { code: facultyCode },
      studentGroup,
      targetYear,
    };

    const existing = await this.courseInstancesRepository.findOne({
      where: query,
      relations: ['course', 'academicPeriod', 'lecturer', 'faculty']
    });

    if (existing && (!excludeId || existing.id !== excludeId)) {
      throw new ConflictException(
        `A course instance with this combination of Course, Academic Period, Faculty, Student Group, and Target Year already exists.`
      );
    }
  }

  async create(createCourseInstanceDto: CreateCourseInstanceDto): Promise<CourseInstance> {
    const [relatedEntities] = await Promise.all([
      this.getRelatedEntities(createCourseInstanceDto),
      this.checkCompositeUniqueConstraint(
        createCourseInstanceDto.courseId,
        createCourseInstanceDto.academicPeriodId,
        createCourseInstanceDto.facultyCode,
        createCourseInstanceDto.studentGroup,
        createCourseInstanceDto.targetYear
      )
    ]);
    console.log('aaaaa')
    const courseInstance = this.courseInstancesRepository.create({
      ...createCourseInstanceDto,
      course: relatedEntities.course,
      academicPeriod: relatedEntities.academicPeriod,
      lecturer: relatedEntities.lecturer,
      faculty: relatedEntities.faculty,
      resources: relatedEntities.resources,
    });

    return this.courseInstancesRepository.save(courseInstance);
  }

  async findAll(): Promise<CourseInstance[]> {
    return this.courseInstancesRepository.find({
      relations: ['course', 'academicPeriod', 'lecturer', 'faculty', 'resources'],
    });
  }

  async findOne(id: string): Promise<CourseInstance> {
    const instance = await this.courseInstancesRepository.findOne({
      where: { id },
      relations: ['course', 'academicPeriod', 'lecturer', 'faculty', 'resources'],
    });
    if (!instance) {
      throw new NotFoundException(`Course instance with ID "${id}" not found.`);
    }
    return instance;
  }


  async update(id: string, updateCourseInstanceDto: UpdateCourseInstanceDto): Promise<CourseInstance> {
    const courseInstance = await this.findOne(id);

    // Determine the values for composite unique constraint check based on existing or DTO
    const newCourseId: string = updateCourseInstanceDto.courseId ?? courseInstance.course.id;
    const newAcademicPeriodId: string = updateCourseInstanceDto.academicPeriodId ?? courseInstance.academicPeriod.id;
    // LecturerUid is calculated for assignment, but NOT for composite unique check
    const newLecturerUid: string | null = updateCourseInstanceDto.lecturerUid ?? courseInstance.lecturer?.uid ?? null;
    const newFacultyCode: string = updateCourseInstanceDto.facultyCode ?? courseInstance.faculty.code;

    const newStudentGroup: number = updateCourseInstanceDto.studentGroup ?? courseInstance.studentGroup;
    const newTargetYear: number = updateCourseInstanceDto.targetYear ?? courseInstance.targetYear;

    // Check if any relevant field for the composite unique constraint has changed
    const hasCompositeFieldsChanged =
      (updateCourseInstanceDto.courseId !== undefined && newCourseId !== courseInstance.course?.id) ||
      (updateCourseInstanceDto.academicPeriodId !== undefined && newAcademicPeriodId !== courseInstance.academicPeriod?.id) ||
      (updateCourseInstanceDto.facultyCode !== undefined && newFacultyCode !== courseInstance.faculty?.code) ||
      (updateCourseInstanceDto.studentGroup !== undefined && newStudentGroup !== courseInstance.studentGroup) ||
      (updateCourseInstanceDto.targetYear !== undefined && newTargetYear !== courseInstance.targetYear);

    // Fetch related entities and perform unique constraint check concurrently
    const [relatedEntities] = await Promise.all([
      this.getRelatedEntities(updateCourseInstanceDto),
      hasCompositeFieldsChanged
        ? this.checkCompositeUniqueConstraint(
          newCourseId,
          newAcademicPeriodId,
          newFacultyCode,
          newStudentGroup,
          newTargetYear,
          id
        )
        : Promise.resolve(), // No need to check if composite fields haven't changed
    ]);

    // Apply updates - merge DTO into the loaded instance
    this.courseInstancesRepository.merge(courseInstance, updateCourseInstanceDto);

    // Explicitly assign fetched relation objects if they were updated/found
    if (relatedEntities.course) courseInstance.course = relatedEntities.course;
    if (relatedEntities.academicPeriod) courseInstance.academicPeriod = relatedEntities.academicPeriod;

    // Handle cases where lecturer might be explicitly set to null/undefined in DTO
    if (updateCourseInstanceDto.lecturerUid !== undefined) courseInstance.lecturer = relatedEntities.lecturer ?? null;

    if (relatedEntities.faculty) courseInstance.faculty = relatedEntities.faculty;

    // Handle ManyToMany resources: if resourceIds were explicitly provided, update them
    if (updateCourseInstanceDto.resourceIds !== undefined) {
      courseInstance.resources = relatedEntities.resources || [];
    }

    return this.courseInstancesRepository.save(courseInstance);
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseInstancesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course instance with ID "${id}" not found.`);
    }
  }
}
