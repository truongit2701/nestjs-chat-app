import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   user_id: number;

   @Column()
   conversation_id: number;

   @Column({ default: 0 })
   type: number;

   @Column({ default: '' })
   content: string;

   @CreateDateColumn()
   created_at: Date;
}
