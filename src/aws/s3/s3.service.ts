import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';
import { throwApiErrorResponse } from 'src/common/functions';

@Injectable()
export class S3Service {
  constructor(@InjectAwsService(S3) private readonly s3: S3) {}

  async listBuckets(): Promise<S3.Bucket[]> {
    try {
      const { Buckets } = await this.s3.listBuckets().promise();
      return Buckets;
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    file: Buffer,
  ): Promise<string> {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file,
    };
    try {
      await this.s3.putObject(params).promise();
      return fileName;
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }

  async readFile(bucketName: string, fileName: string): Promise<Buffer> {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };
    try {
      const { Body } = await this.s3.getObject(params).promise();
      return Body as Buffer;
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}
