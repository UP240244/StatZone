import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EquipoDocument = HydratedDocument<Equipo>;

@Schema({ collection: 'equipos', versionKey: false })
export class Equipo {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ trim: true, default: '' })
  ciudad!: string;
}

export const EquipoSchema = SchemaFactory.createForClass(Equipo);