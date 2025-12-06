import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  // Criar usuário padrão na inicialização
  async onModuleInit() {
    await this.createDefaultUser();
  }

  private async createDefaultUser() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    const exists = await this.userModel.findOne({ email: adminEmail });
    if (exists) {
      this.logger.log('✅ Usuário padrão já existe');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || '123456',
      10,
    );

    await this.userModel.create({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      city: process.env.ADMIN_CITY || 'São Paulo',
      role: 'admin',
      provider: 'local',
    });

    this.logger.log(
      `✅ Usuário padrão criado: ${adminEmail} / ${process.env.ADMIN_PASSWORD || '123456'}`,
    );
  }

  private async startCollectorForCity(city: string): Promise<void> {
    const collectorUrl = this.configService.get<string>('COLLECTOR_URL');

    try {
      await firstValueFrom(
        this.httpService.post(
          `${collectorUrl}/city`,
          { city },
          { timeout: 5000 },
        ),
      );
      this.logger.log(`✅ Coleta iniciada/atualizada para cidade: ${city}`);
    } catch (error) {
      this.logger.warn(
        `⚠️ Falha ao iniciar coleta no Collector: ${error.message}`,
      );
    }
  }

  // CREATE
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se email já existe
    const exists = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (exists) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha (se for login local)
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }

    const user = new this.userModel(createUserDto);
    return user.save();
  }

  // READ - Buscar por email
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // READ - Buscar por Google ID
  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  // READ - Buscar por ID
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  // READ - Listar todos (admin only)
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  // UPDATE
  async update(userId: string, updateUserDto: UpdateUserDto) {
    const oldUser = await this.findById(userId);

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se a cidade mudou, disparar coleta
    if (updateUserDto.city && oldUser.city !== updateUserDto.city) {
      this.startCollectorForCity(updateUserDto.city);
    }

    return updatedUser;
  }

  // UPDATE - Trocar senha
  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se é usuário OAuth (não tem senha)
    if (!user.password) {
      throw new BadRequestException('Usuários OAuth não podem trocar senha');
    }

    // Verificar senha atual
    const isValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );
    if (!isValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Atualizar senha
    user.password = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await user.save();
  }

  // DELETE
  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  // Verificar senha (para login)
  async validatePassword(
    user: UserDocument,
    password: string,
  ): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }
}
