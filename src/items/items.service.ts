import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { /* Like, */ Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { SearchArgs } from '../common/dto/args';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user });

    return this.itemsRepository.save(newItem);
  }

  async findAll(user: User, searchArgs: SearchArgs): Promise<Item[]> {
    const { limit, offset, search } = searchArgs;

    // return this.itemsRepository.find({
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user: {
    //       id: user.id,
    //     },
    //     name: Like(`%${search}%`),
    //   },
    // });

    const queryBuilder = this.itemsRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: { id: user.id },
    });

    if (!item) throw new NotFoundException(`Item with id: ${id} not found`);

    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);

    const item = await this.itemsRepository.preload(updateItemInput);

    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    // TODO: soft delete, integridad referencial
    const item = await this.findOne(id, user);

    await this.itemsRepository.remove(item);

    return { ...item, id };
  }

  async itemCountByUser(user: User): Promise<number> {
    return this.itemsRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
