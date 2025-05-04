import { Inject, Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Reader } from './db/entities/reader.entity';
import { DeleteResult, FindManyOptions, In, IsNull, Repository } from 'typeorm';
import { FABREADER_DB_DATASOURCE_NAME } from './db/datasource';
import { NFCCard } from './db/entities/nfcCard.entity';
import { securelyHashToken } from '../websockets/websocket.utils';
import { Resource, ResourceUsage, User, PLUGIN_API_SERVICE, PluginApiService } from '@attraccess/plugins-backend-sdk';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DbService {
  private readonly logger = new Logger(DbService.name);

  public constructor(
    @InjectRepository(Reader, FABREADER_DB_DATASOURCE_NAME)
    private readonly readerRepository: Repository<Reader>,
    @InjectRepository(NFCCard, FABREADER_DB_DATASOURCE_NAME)
    private readonly nfcCardRepository: Repository<NFCCard>,
    @Inject(PLUGIN_API_SERVICE)
    private readonly pluginApiService: PluginApiService
  ) {}

  public async createNewReader(): Promise<{ reader: Reader; token: string }> {
    const token = nanoid(16);
    const apiTokenHash = await securelyHashToken(token);

    const reader = await this.readerRepository.save({
      apiTokenHash,
      name: nanoid(4),
    });

    return {
      reader,
      token,
    };
  }

  public async findReaderById(id: number): Promise<Reader | undefined> {
    return await this.readerRepository.findOne({ where: { id } });
  }

  public async updateLastReaderConnection(id: number) {
    return await this.readerRepository.update(id, { lastConnection: new Date() });
  }

  public async getAllReaders(options?: FindManyOptions<Reader>): Promise<Reader[]> {
    return await this.readerRepository.find(options);
  }

  public async getNFCCardByUID(uid: string): Promise<NFCCard | undefined> {
    return await this.nfcCardRepository.findOne({ where: { uid } });
  }

  public async getNFCCardByID(id: number): Promise<NFCCard | undefined> {
    return await this.nfcCardRepository.findOne({ where: { id } });
  }

  public async getAllNFCCards(): Promise<NFCCard[]> {
    return await this.nfcCardRepository.find();
  }

  public async getNFCCardsByUserId(userId: number): Promise<NFCCard[]> {
    return await this.nfcCardRepository.find({ where: { userId } });
  }

  public async createNFCCard(data: Omit<NFCCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<NFCCard> {
    return await this.nfcCardRepository.save(data);
  }

  public async deleteNFCCard(id: number): Promise<DeleteResult> {
    return await this.nfcCardRepository.delete(id);
  }

  public async getUserById(id: number): Promise<User | undefined> {
    const userRepository = this.pluginApiService.getRepository<User>('User');
    return await userRepository.findOne({ where: { id } });
  }

  public async startResourceUsage(data: { resourceId: number; userId: number; cardId: number; readerId: number }) {
    const resourceUsageRepository = this.pluginApiService.getRepository<ResourceUsage>('ResourceUsage');
    return await resourceUsageRepository.save({
      resourceId: data.resourceId,
      userId: data.userId,
      startTime: new Date(),
      startNotes: `-- by Fabreader (ID: ${data.readerId}) with NFC Card (ID: ${data.cardId}) --`,
      endTime: null,
      endNotes: null,
    } as ResourceUsage);
  }

  public async stopResourceUsage(data: { resourceId: number; userId: number; readerId: number; cardId: number }) {
    const activeUsageSession = await this.getActiveResourceUsageSession(data.resourceId, data.userId);

    if (!activeUsageSession) {
      this.logger.warn(`Resource not in use, skipping stopResourceUsage for ${data.resourceId}`);
      return;
    }

    activeUsageSession.endTime = new Date();
    activeUsageSession.endNotes = `-- by Fabreader (ID: ${data.readerId}) with NFC Card (ID: ${data.cardId}) --`;

    const resourceUsageRepository = this.pluginApiService.getRepository<ResourceUsage>('ResourceUsage');
    return await resourceUsageRepository.save(activeUsageSession);
  }

  public async getActiveResourceUsageSession(resourceId: Resource['id'], userId?: User['id']) {
    const resourceUsageRepository = this.pluginApiService.getRepository<ResourceUsage>('ResourceUsage');
    return await resourceUsageRepository.findOne({
      where: {
        resourceId,
        endTime: IsNull(),
        ...(userId ? { userId } : {}),
      },
    });
  }

  public async getManyResourcesById(resourceIds: number[]): Promise<Resource[]> {
    const resourceRepository = this.pluginApiService.getRepository<Resource>('Resource');
    return await resourceRepository.find({ where: { id: In(resourceIds) } });
  }

  public async updateReader(id: number, updateData: { name?: string; connectedResources?: number[] }): Promise<Reader> {
    const reader = await this.findReaderById(id);

    if (!reader) {
      throw new Error(`Reader with ID ${id} not found`);
    }

    if (updateData.name) {
      reader.name = updateData.name;
    }

    if (updateData.connectedResources) {
      reader.hasAccessToResourceIds = updateData.connectedResources;
    }

    return await this.readerRepository.save(reader);
  }
}
