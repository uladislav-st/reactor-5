import { IGameApi } from './interfaces/IGameApi';
import { MockGameApi } from './mock/MockGameApi';

export class ApiFactory {
  static create(): IGameApi {
    return new MockGameApi();

    // later:
    // return new HttpGameApi();
  }
}
