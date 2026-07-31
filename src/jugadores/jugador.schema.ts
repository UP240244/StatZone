import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type JugadorDocument = HydratedDocument<Jugador>;

@Schema({ collection: 'jugadores', versionKey: false })
export class Jugador {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ type: Types.ObjectId, ref: 'Equipo', required: true })
  equipoId!: Types.ObjectId;

  @Prop({ default: 'MED', enum: ['POR', 'DEF', 'MED', 'DEL'] })
  pos!: string;

  @Prop({ default: 0, min: 0 })
  goles!: number;
}

export const JugadorSchema = SchemaFactory.createForClass(Jugador);

// Permite buscar con $text en lugar de recorrer documento por documento
JugadorSchema.index(
  { nombre: 'text' },
  { default_language: 'spanish', name: 'idx_texto_jugador' },
);
