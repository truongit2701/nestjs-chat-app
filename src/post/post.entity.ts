import { Comment } from "src/comment/entities/comment.entity";
import { Column, CreateDateColumn, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Post {
   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   content: string;

   @Column()
   user_id: number;

   @Column("int", { array: true, nullable: true })
   like_total: number[];

   @Column()
   image: string;

   @OneToMany(() => Comment, (comment) => comment.post)
   comments: Comment[];

   @CreateDateColumn()
   created_at: Date;
}
