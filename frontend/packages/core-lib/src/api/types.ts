import { api } from './clients';

export type UserMe = Awaited<
  ReturnType<typeof api.usersGetProfileMe>
>['data']['item'];
