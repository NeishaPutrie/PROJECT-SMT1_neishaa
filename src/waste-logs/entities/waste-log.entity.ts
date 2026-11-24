import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Ingredient } from '../../ingredients/entities/ingredient.entity.js';

@Entity('waste_logs')
export class WasteLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'ingredient_id', nullable: true })
  ingredientId: string;

  @Column({ type: 'double precision', default: 0 })
  quantity: number;

  @Column({ nullable: true })
  reason: string;

  @Column({ type: 'timestamptz', name: 'logged_at', default: () => 'now()' })
  loggedAt: Date;

  @ManyToOne(() => User, (user) => user.wasteLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Ingredient, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}
