import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const existing = await this.findByUsername(createUsuarioDto.nombreUsuario);
    if (existing) {
      throw new BadRequestException('El nombre de usuario ya está en uso.');
    }
    const usuario = this.usuariosRepository.create(createUsuarioDto);
    return this.usuariosRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find({ relations: { empleado: true } });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      relations: { empleado: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return usuario;
  }

  async findByUsername(nombreUsuario: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { nombreUsuario },
      relations: { empleado: true },
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.nombreUsuario && updateUsuarioDto.nombreUsuario !== usuario.nombreUsuario) {
      const existing = await this.findByUsername(updateUsuarioDto.nombreUsuario);
      if (existing) {
        throw new BadRequestException('El nombre de usuario ya está en uso.');
      }
    }

    this.usuariosRepository.merge(usuario, updateUsuarioDto);
    return this.usuariosRepository.save(usuario);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuariosRepository.remove(usuario);
  }
}
