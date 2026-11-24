import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Ingredient } from '../../ingredients/entities/ingredient.entity.js';

@Entity('pantry_items')
export class PantryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'ingredient_id' })
  ingredientId: string;

  @Column({ type: 'double precision', default: 0 })
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'date', name: 'expires_at', nullable: true })
  expiresAt: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.pantryItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.pantryItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}
