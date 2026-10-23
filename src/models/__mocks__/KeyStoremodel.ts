import {vi} from "vitest";

export const KeyStoreModelMock :any= {
    findOne: vi.fn(),
    create: vi.fn(),
}
export const KeyModel = KeyStoreModelMock;
