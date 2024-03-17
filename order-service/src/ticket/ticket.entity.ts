import { Entity, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Ticket {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  price: number;

  @VersionColumn()
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
