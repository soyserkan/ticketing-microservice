import { Entity, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, PrimaryColumn } from 'typeorm';
import { OrderStatus } from '@ssticketmicroservice/common';

@Entity()
export class Order {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ enum: OrderStatus, default: OrderStatus.Created })
  status: OrderStatus;

  @VersionColumn()
  version: number;

  @Column({ nullable: false, type: 'float' })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
