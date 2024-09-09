import { Post } from "src/post/post.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comment {
   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   content: string;

   @Column()
   user_id: number;

   @ManyToOne(() => Post, (post) => post.id)
   @JoinColumn({ name: 'post_id' })
   post: Post;

   @CreateDateColumn()
   created_at: Date;
}
