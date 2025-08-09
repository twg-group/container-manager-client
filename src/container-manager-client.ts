import axios, { AxiosInstance } from 'axios';
import { plainToInstance } from 'class-transformer';
import {DeployConfigDto, InfoDto, ListFilterDto, LogDto} from "@twg-group/container-manager";

export class ContainerClient {
    private readonly http: AxiosInstance;

    constructor(
        private readonly baseUrl: string,
        private readonly options: {
            timeout?: number;
            token?: string;
        } = {},
    ) {
        this.http = axios.create({
            baseURL: `${baseUrl.replace(/\/$/, '')}/containers`,
            timeout: options.timeout ?? 10_000,
            headers: {
                'Content-Type': 'application/json',
                Authorization: options.token ? `Bearer ${options.token}` : undefined,
            },
        });
    }

    async deploy(config: DeployConfigDto): Promise<{ id: string }> {
        const { data } = await this.http.post<{ id: string }>('/', config);
        return data;
    }

    async list(filter?: ListFilterDto): Promise<{ containers: InfoDto[] }> {
        const { data } = await this.http.get<{ containers: unknown[] }>('', {
            params: filter,
        });
        return {
            containers: plainToInstance(InfoDto, data.containers),
        };
    }

    async getById(id: string): Promise<InfoDto> {
        const { data } = await this.http.get<unknown>(`/${id}`);
        return plainToInstance(InfoDto, data);
    }

    async getLogs(
        id: string,
        since?: string,
        tail?: number,
    ): Promise<{ logs: LogDto[] }> {
        const params = { since, tail };
        const { data } = await this.http.get<{ logs: unknown[] }>(`/${id}/logs`, {
            params,
        });
        return {
            logs: plainToInstance(LogDto, data.logs),
        };
    }

    async start(id: string): Promise<{ status: string }> {
        const { data } = await this.http.post<{ status: string }>(`/${id}/start`);
        return data;
    }

    async stop(id: string, timeout?: number): Promise<{ status: string }> {
        const { data } = await this.http.post<{ status: string }>(
            `/${id}/stop`,
            undefined,
            { params: timeout ? { timeout } : {} },
        );
        return data;
    }

    async remove(id: string): Promise<void> {
        await this.http.delete(`/${id}`);
    }
}
