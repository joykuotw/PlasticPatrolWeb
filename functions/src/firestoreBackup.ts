import * as storage from '@google-cloud/storage';
import * as admin from 'firebase-admin';
import UserRecord = admin.auth.UserRecord;

const client = new admin.firestore.v1.FirestoreAdminClient({});

// Weekly at Sunday midnight
export const BACKUP_CRONTAB = "0 0 * * 1";

const USERS_RETRIEVED_PER_API_CALL = 1000;

const getDateString = (): string => {
  const currentDate = new Date();
  const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(currentDate);
  const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(currentDate);
  const date = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
  return `${date}-${month}-${year}`;
}

const backupFirestore = async (projectId: string, bucketName: string, backupFolderName: string): Promise<void> => {
  const databaseName = client.databasePath(projectId, '(default)')
  const firestoreFolder = `gs://${bucketName}/${backupFolderName}/firestore`

  try {
    await client
      .exportDocuments({
        name: databaseName,
        outputUriPrefix: firestoreFolder,
        // Empty array == all collections
        collectionIds: []
      });
  } catch (err) {
    throw new Error(`Export operation failed. ${err}`);
  }

  console.log(`Finished backing up Firestore`);
}

const getUsers = async (nextPageToken?: string): Promise<UserRecord[]> => {
  if (nextPageToken === undefined) {
    return [];
  }
  const listUsersResult = await admin.auth().listUsers(USERS_RETRIEVED_PER_API_CALL, nextPageToken);

  return listUsersResult.users.concat(await getUsers(nextPageToken));
}

const backupUsers = async (bucketName: string, backupFolder: string): Promise<void> => {
  console.log(`Backing up users`);

  // List batch of users, 1000 at a time.
  let usersRecords: UserRecord[] = [];
  try {
    const initialUserList = await admin.auth().listUsers(USERS_RETRIEVED_PER_API_CALL);
    // Results are paginated, if we have more than USERS_RETRIEVED_PER_API_CALL, we recurse till we
    // got all of them.
    const additionalUsers = await getUsers(initialUserList.pageToken);
    usersRecords = initialUserList.users.concat(additionalUsers);
  } catch (err) {
    console.log(`Error listing users: ${err}`);
  }

  console.log(`Found ${usersRecords.length} users`);

  const store = new storage.Storage();
  const bucket = store.bucket(bucketName);
  const file = bucket.file(`${backupFolder}/users.json`);

  try {
    await file.save(Buffer.from(JSON.stringify({ users: usersRecords })));
  } catch (err) {
    console.log(`Failed upload users.json. ${err}`);
  }

  console.log(`Finished uploading users.`);
}

export const backupProject = async (): Promise<void> => {
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || "";
  const bucketName = `${projectId}-backups`
  const backupFolderName = getDateString();

  await backupFirestore(projectId, bucketName, backupFolderName)
  await backupUsers(bucketName, backupFolderName);

  console.log(`Finished backing up to https://console.cloud.google.com/storage/browser/${bucketName}/${backupFolderName}`);
}