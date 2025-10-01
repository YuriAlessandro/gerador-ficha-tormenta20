import { SerializedSheetInterface } from 't20-sheet-builder';
import api from './api';

export interface SheetData {
  id: string;
  userId: string;
  name: string;
  sheetData: SerializedSheetInterface & { isThreat?: boolean };
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSheetRequest {
  name: string;
  sheetData: SerializedSheetInterface & { isThreat?: boolean };
  image?: string;
  description?: string;
}

export interface UpdateSheetRequest {
  name?: string;
  sheetData?: SerializedSheetInterface & { isThreat?: boolean };
  image?: string;
  description?: string;
}

export interface SheetResponse {
  success: boolean;
  data: SheetData;
  message?: string;
}

export interface SheetsListResponse {
  success: boolean;
  data: SheetData[];
  count: number;
}

interface MongoSheetData {
  id?: string;
  userId: string;
  name: string;
  sheetData: SerializedSheetInterface & { isThreat?: boolean };
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

class SheetsService {
  // Helper to map MongoDB response to SheetData
  private static mapSheetData(
    sheet: MongoSheetData & Record<string, unknown>
  ): SheetData {
    // eslint-disable-next-line dot-notation
    const mongoId = sheet['_id'] as string | undefined;
    return {
      id: mongoId || sheet.id || '',
      userId: sheet.userId,
      name: sheet.name,
      sheetData: sheet.sheetData,
      image: sheet.image,
      description: sheet.description,
      createdAt: sheet.createdAt,
      updatedAt: sheet.updatedAt,
    };
  }

  // Get all sheets for authenticated user
  static async getUserSheets(): Promise<SheetData[]> {
    const { data } = await api.get<SheetsListResponse>('/api/sheets');
    return data.data.map((sheet) =>
      SheetsService.mapSheetData(
        sheet as MongoSheetData & Record<string, unknown>
      )
    );
  }

  // Get specific sheet by ID
  static async getSheetById(id: string): Promise<SheetData> {
    const { data } = await api.get<SheetResponse>(`/api/sheets/${id}`);
    return SheetsService.mapSheetData(
      data.data as MongoSheetData & Record<string, unknown>
    );
  }

  // Create new sheet
  static async createSheet(
    sheetRequest: CreateSheetRequest
  ): Promise<SheetData> {
    const { data } = await api.post<SheetResponse>('/api/sheets', sheetRequest);
    return SheetsService.mapSheetData(
      data.data as MongoSheetData & Record<string, unknown>
    );
  }

  // Update existing sheet
  static async updateSheet(
    id: string,
    updates: UpdateSheetRequest
  ): Promise<SheetData> {
    const { data } = await api.put<SheetResponse>(`/api/sheets/${id}`, updates);
    return SheetsService.mapSheetData(
      data.data as MongoSheetData & Record<string, unknown>
    );
  }

  // Delete sheet
  static async deleteSheet(id: string): Promise<void> {
    await api.delete(`/api/sheets/${id}`);
  }

  // Duplicate sheet
  static async duplicateSheet(id: string): Promise<SheetData> {
    const { data } = await api.post<SheetResponse>(
      `/api/sheets/${id}/duplicate`
    );
    return SheetsService.mapSheetData(
      data.data as MongoSheetData & Record<string, unknown>
    );
  }

  // Generate description from sheet data
  static generateDescription(sheetData: SerializedSheetInterface): string {
    let description = '';

    if (sheetData.race?.name) {
      description += sheetData.race.name;
    }

    if (sheetData.role?.name) {
      description += ` ${sheetData.role.name}`;
    }

    if (sheetData.origin?.name) {
      description += `, ${sheetData.origin.name}`;
    }

    if (sheetData.devotion?.devotion?.deity?.name) {
      description += `, Devoto de ${sheetData.devotion.devotion.deity.name}`;
    }

    return description;
  }
}

export default SheetsService;
