import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';

@Entity()
export class Conversation {
   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   name: string;

   @Column({ default: 0 })
   user_id: number;

   @Column({ default: 0 })
   last_message_id: number;

   @ManyToMany(() => User)
   @JoinTable()
   participants: User[];
}
