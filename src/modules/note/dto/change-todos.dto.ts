import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { TodoDto } from 'src/models/todo.dto';

export class ChangeTodosDto {
  @IsString()
  noteId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TodoDto)
  todos: TodoDto[];
}
