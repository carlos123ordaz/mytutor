import { Storage } from '@google-cloud/storage';
import { env } from './env';

let storage: Storage;
let bucketName: string;

function getStorage(): Storage {
  if (!storage) {
    if (env.gcsCredentials) {
      const credentials = JSON.parse(env.gcsCredentials);
      storage = new Storage({ credentials, projectId: env.gcsProjectId });
    } else {
      // Fallback: use application default credentials (e.g., in CI/Cloud environments)
      console.warn('⚠️  GCS credentials not set, using default credentials');
      storage = new Storage({ projectId: env.gcsProjectId });
    }
  }
  return storage;
}

export function getBucket() {
  bucketName = env.gcsBucketName;
  return getStorage().bucket(bucketName);
}

export async function uploadFileToBucket(
  fileBuffer: Buffer,
  destination: string,
  mimetype: string
): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(destination);

  await file.save(fileBuffer, {
    metadata: { contentType: mimetype },
    resumable: false,
  });

  return `https://storage.googleapis.com/${bucketName}/${destination}`;
}

export async function getSignedUrl(storageKey: string, expiresInMinutes = 60): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(storageKey);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });

  return url;
}

export async function deleteFileFromBucket(storageKey: string): Promise<void> {
  const bucket = getBucket();
  await bucket.file(storageKey).delete({ ignoreNotFound: true });
}
