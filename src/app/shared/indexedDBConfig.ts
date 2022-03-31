import { DBConfig } from 'ngx-indexed-db';
export const dbConfig: DBConfig = {
  name: 'farmerOnBoarding2_DB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'registerFarmer',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'pageName', keypath: 'pageName', options: { unique: false } },
        { name: 'fileFor', keypath: 'fileFor', options: { unique: false } },
      ],
    },
  ],
};
