import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
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

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
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
