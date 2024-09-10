import { Repository, DataSource, FindOneOptions, Int32 } from 'typeorm';
import { Project_User } from '../entities/Project_User';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { FollowerService } from './follower.service';
import { FollowerDetailService } from './followerDetail.service';
import { AppDataSource } from '../data-source';
import { Follower, FollowerDetail } from '../entities/Follower';

export class Project_UserService {
  private projectUserRepository: Repository<Project_User>;
  private followerDetailRepository: Repository<FollowerDetail>;
  private followerRepository: Repository<Follower>;
  private followerService: FollowerService;
  private followerDetailService: FollowerDetailService;

  constructor(dataSource: DataSource) {
    this.projectUserRepository = dataSource.getRepository(Project_User);
    this.followerDetailRepository = dataSource.getRepository(FollowerDetail);
    this.followerRepository = dataSource.getRepository(Follower);
    this.followerService = new FollowerService(AppDataSource);
    this.followerDetailService = new FollowerDetailService(AppDataSource);
  }

  public getAll = async (): Promise<Project_User[]> => {
    return this.projectUserRepository.find({
      relations: ['project', 'user']
    });
  }

  public getById = async (id: string): Promise<Project_User | null> => {
    const options: FindOneOptions<Project_User> = {
      where: { id },
      relations: [
        'project',
        'user',
        'project.createUser',
        'project.instructor',
        'project.lastModifyUser',
        'project.faculty',
        'project.follower',
        'project.follower.followerDetails',
        'project.follower.followerDetails.user'
      ]
    };
    return this.projectUserRepository.findOne(options);
  }

  public create = async (projectUserData: Partial<Project_User>): Promise<Project_User> => {
    const projectUser = this.projectUserRepository.create(projectUserData);
    return this.projectUserRepository.save(projectUser);
  }

  public update = async (id: string, projectUserData: Partial<Project_User>): Promise<Project_User | null> => {
    await this.projectUserRepository.update(id, projectUserData);

    const updatedProjectUser = await this.projectUserRepository.findOne({
      where: { id },
      relations: ['project', 'user']
    });

    if (updatedProjectUser) {
      // Tìm follower bằng projectId
      const follower = await this.followerService.getByProjectId(updatedProjectUser.project.projectId);
      // Nếu đã có follower => Thêm detail
      if (follower) {
        const followerDetail = await this.followerDetailService.findByUserAndFollower(updatedProjectUser.user, follower);
        if (projectUserData.isApprove) {
          // Thêm người theo dõi
          if (!followerDetail) {
            const newFollowerDetail = new FollowerDetail();
            newFollowerDetail.follower = follower;
            newFollowerDetail.user = updatedProjectUser.user;
            await this.followerDetailRepository.save(newFollowerDetail);
          }
        } else {
          // Xóa người theo dõi
          if (followerDetail) {
            await this.followerDetailRepository.remove(followerDetail);
          }
        }
      }
      // Chưa có follower => Tạo mới follower trước khi thêm detail
      else {
        // Chưa có follower => không xử lý trường hợp Hủy duyệt (isApprove = false)
        // Do Hủy duyệt => Xóa followerDetail nhưng chưa có follower nên không cần xử lý
        if (projectUserData.isApprove) {
          const newFollower = new Follower();
          newFollower.project = updatedProjectUser.project;
          const newfollowerCreate = await this.followerRepository.save(newFollower);
          const followerDetail = await this.followerDetailService.findByUserAndFollower(updatedProjectUser.user, newfollowerCreate);

          // Thêm người theo dõi
          if (!followerDetail) {
            const newFollowerDetail = new FollowerDetail();
            newFollowerDetail.follower = newfollowerCreate;
            newFollowerDetail.user = updatedProjectUser.user;
            await this.followerDetailRepository.save(newFollowerDetail);
          }
        }
      }
    }

    return updatedProjectUser;
  }


  public delete = async (id: string): Promise<boolean> => {
    const result = await this.projectUserRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  public getHighestGroupProjectUser = async (): Promise<number> => {
    const projectUsers = await this.projectUserRepository.find({
      order: { group: 'DESC' },  // Sort by `group` in descending order
      relations: ['project', 'user'],
      take: 1  // Limit to one result
    });

    // If no rows are found, return 0
    if (!projectUsers.length) {
      return 0;
    }

    const projectUser = projectUsers[0];
    return projectUser.group || 0;
  }

  public getByUserId = async (user: User): Promise<Project_User[]> => {
    const options: FindOneOptions<Project_User> = {
      where: { user },
      relations: ['project', 'user', 'project.createUser', 'project.instructor', 'project.lastModifyUser', 'project.faculty']
    };
    return this.projectUserRepository.find(options);
  }

  public getByProjectId = async (project: Project): Promise<Project_User[]> => {
    const options: FindOneOptions<Project_User> = {
      where: { project: { projectId: project.projectId } },
      relations: ['project', 'user', 'project.createUser', 'project.instructor', 'project.lastModifyUser', 'project.faculty']
    };
    return this.projectUserRepository.find(options);
  }

  // Xóa bằng user và project
  public deleteByUserAndProject = async (user: User, project: Project): Promise<boolean> => {
    const result = await this.projectUserRepository.delete({
      user,
      project
    });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}