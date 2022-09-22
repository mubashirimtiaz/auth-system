import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
export class S3Service {
  constructor(@InjectAwsService(S3) private readonly s3: S3) {}

  async listBuckets(): Promise<S3.Bucket[]> {
    const { Buckets } = await this.s3.listBuckets().promise();
    return Buckets;
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
    await this.s3.putObject(params).promise();
    return fileName;
  }
}
