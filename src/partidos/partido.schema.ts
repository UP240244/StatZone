import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PartidoDocument = HydratedDocument<Partido>;

@Schema({ collection: 'partidos', versionKey: false })
export class Partido {
  @Prop({ type: Types.ObjectId, ref: 'Equipo', required: true })
  localId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Equipo', required: true })
  visitanteId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  golesLocal!: number;

  @Prop({ required: true, min: 0 })
  golesVisitante!: number;

  @Prop({ default: Date.now })
  fecha!: Date;
}

export const PartidoSchema = SchemaFactory.createForClass(Partido);
