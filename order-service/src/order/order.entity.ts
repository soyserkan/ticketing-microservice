import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, VersionColumn } from 'typeorm';
import { Ticket } from 'src/ticket/ticket.entity';
import { OrderStatus } from '@ssticketmicroservice/common';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ enum: OrderStatus, default: OrderStatus.Created })
  status: OrderStatus;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @OneToOne(() => Ticket)
  @JoinColumn()
  ticket: Ticket;

  @VersionColumn()
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
