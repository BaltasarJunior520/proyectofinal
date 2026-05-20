import { PartialType } from '@nestjs/swagger';
import { CreateEnvioDto } from './create-envio.dto';

export class UpdateEnvioDto extends PartialType(CreateEnvioDto) {}
