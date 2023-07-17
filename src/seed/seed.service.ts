import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '../items/entities/item.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListItem } from '../list-item/entities/list-item.entity';
import { List } from '../lists/entities/list.entity';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly listItemService: ListItemService,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async executeSeed() {
    if (this.isProd) {
      throw new UnauthorizedException('We cannot run SEED on Prod');
    }
    //	Limpiar la base de datos BORRAR TODO
    await this.deleteDatabase();

    //	Crear usuarios
    const user = await this.loadUsers();

    //	Crear items
    await this.loadItems(user);

    // Crear listas
    const list = await this.loadLists(user);

    // Crear listItems
    const items = await this.itemsService.findAll(user, { limit: 15 });
    await this.loadListItems(list, items);

    return true;
  }

  async deleteDatabase() {
    // Borrar los listItems
    await this.listItemRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Borrar los lists
    await this.listsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Borrar los items
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    // Borrar los users
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers(): Promise<User> {
    const users = [];

    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }

    return users[0];
  }

  async loadItems(user: User): Promise<void> {
    const itemsToLoad = SEED_ITEMS ?? [];

    await Promise.all(
      itemsToLoad.map(async (item) => {
        await this.itemsService.create(item, user);
      }),
    );
  }

  async loadLists(user: User): Promise<List> {
    const listsToLoad = SEED_LISTS ?? [];

    const lists = await Promise.all(
      listsToLoad.map(async (list) => {
        return await this.listsService.create(list, user);
      }),
    );

    return lists[0];
  }

  async loadListItems(list: List, items: Item[]): Promise<void> {
    await Promise.all(
      items.map(async (item) => {
        await this.listItemService.create({
          quantity: Math.round(Math.random() * 10),
          completed: !!Math.round(Math.random()),
          listId: list.id,
          itemId: item.id,
        });
      }),
    );
  }
}
