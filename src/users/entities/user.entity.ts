import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PantryItem } from '../../pantry-items/entities/pantry-item.entity.js';
import { WasteLog } from '../../waste-logs/entities/waste-log.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PantryItem, (pantryItem) => pantryItem.user)
  pantryItems: PantryItem[];

  @OneToMany(() => WasteLog, (wasteLog) => wasteLog.user)
  wasteLogs: WasteLog[];
}
