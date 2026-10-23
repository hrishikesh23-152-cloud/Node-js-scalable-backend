import {vi} from "vitest";


const UserModelMock :any= {
    findOne: vi.fn(),
    create: vi.fn(),
}
export default UserModelMock;