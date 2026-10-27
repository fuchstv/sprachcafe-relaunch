let mockGetCollectionImpl: (collection: string) => Promise<any[]> = async () => [];

export function setMockGetCollection(impl: (collection: string) => Promise<any[]>) {
  mockGetCollectionImpl = impl;
}

export function resetMockGetCollection() {
  mockGetCollectionImpl = async () => [];
}

export const getCollection = async (collection: string) => {
  return mockGetCollectionImpl(collection);
};
