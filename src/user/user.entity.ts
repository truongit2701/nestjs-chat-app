import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   username: string;

   @Column()
   password: string;

   @Column({ default: '' })
   avatar: string;
}
