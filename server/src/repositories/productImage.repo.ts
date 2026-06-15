// src/repositories/ProductImageRepository.ts
import type { Pool, ResultSetHeader } from 'mysql2/promise';

export class ProductImageRepository {
  constructor(private pool: Pool) {}

  async create(data: {
    image_url: string;
    file_name: string;
    file_size: number;
    mimetype: string;
  }) {
    const query = `
      INSERT INTO product_images (image_url, file_name, file_size, mimetype)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await this.pool.query<ResultSetHeader>(query, [
      data.image_url,
      data.file_name,
      data.file_size,
      data.mimetype
    ]);
    return result.insertId;
  }
}