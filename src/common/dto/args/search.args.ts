import { ArgsType, Field } from '@nestjs/graphql';
import { PaginationArgs } from './pagination.args';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class SearchArgs extends PaginationArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}
