import {vi} from "vitest";

export enum RoleCode {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export const roleModelMock :any= {
    findOne: vi.fn(),
    create: vi.fn(),
}
export default roleModelMock;